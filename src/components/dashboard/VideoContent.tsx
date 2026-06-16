"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import {
  Play,
  Clock,
  Trophy,
  CheckCircle,
  Loader2,
  Award,
  Eye,
  Filter,
  Search,
  X,
  AlertCircle,
  Wallet,
  ExternalLink,
} from "lucide-react";
import {
  getAllRewardVideos,
  getProfileByWallet,
  getUserVideoProgress,
  updateVideoProgress,
  completeVideo,
  type RewardVideo,
  type UserVideoProgress,
} from "@/lib/queries";
import { ensureProfileExists, addPointsToProfile } from "@/lib/profileUtils";
import {
  WATCH_REWARD_ADDRESS,
  WATCH_REWARD_ABI,
  BASE_SEPOLIA_CHAIN_ID,
} from "@/lib/contracts";

interface VideoWithProgress extends RewardVideo {
  progress?: UserVideoProgress | null;
  isCompleted?: boolean;
  watchedSeconds?: number;
}

export function VideoContent(): JSX.Element {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [videos, setVideos] = useState<VideoWithProgress[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoWithProgress[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProgress | null>(
    null
  );
  const [watchedSeconds, setWatchedSeconds] = useState(0); // Separate state for UI updates
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isWatching, setIsWatching] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Claim states
  const [claimStatus, setClaimStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">("idle");
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [pendingVideoCompletion, setPendingVideoCompletion] = useState<VideoWithProgress | null>(null);

  const playerRef = useRef<any>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dbSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Wagmi hooks for contract interaction
  const { writeContract, data: txHash, error: writeError, reset: resetWrite } = useWriteContract();
  
  const { isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Watch for transaction confirmation
  useEffect(() => {
    if (txHash && !claimTxHash) {
      setClaimTxHash(txHash);
      setClaimStatus("confirming");
      console.log("Transaction submitted:", txHash);
    }
  }, [txHash, claimTxHash]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingVideoCompletion) {
      console.log("Transaction confirmed! Processing reward...");
      setClaimStatus("success");
      
      // Complete the video reward flow
      completeVideoReward(pendingVideoCompletion);
    }
  }, [isConfirmed, pendingVideoCompletion]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError);
      setClaimStatus("error");
      setErrorMessage(`Claim failed: ${writeError.message || "Transaction rejected"}`);
      setPendingVideoCompletion(null);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [writeError]);

  // Handle confirmation errors
  useEffect(() => {
    if (confirmError) {
      console.error("Transaction confirmation error:", confirmError);
      setClaimStatus("error");
      setErrorMessage(`Transaction failed: ${confirmError.message || "Unknown error"}`);
      setPendingVideoCompletion(null);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [confirmError]);

  // Complete video reward after successful claim
  const completeVideoReward = async (video: VideoWithProgress) => {
    if (!profileId) return;
    
    try {
      // Mark video as completed in database
      console.log("Step 1: Completing video in database...");
      const completeResult = await completeVideo(profileId, video.id);

      if (!completeResult) {
        throw new Error("Failed to mark video as completed");
      }

      console.log("Step 2: Video completion recorded successfully");

      // Add points to profile
      console.log("Step 3: Adding points to profile...");
      const pointsResult = await addPointsToProfile(
        profileId,
        video.reward_points_amount,
        video.id,
        "video_watch"
      );

      if (!pointsResult) {
        throw new Error("Failed to add points to profile");
      }

      console.log(`Step 4: Successfully earned ${video.reward_points_amount} OWT tokens!`);

      // Update UI
      setEarnedPoints(video.reward_points_amount);
      setShowRewardModal(true);

      // Update video list
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, isCompleted: true } : v
        )
      );

      setSelectedVideo((prev) =>
        prev ? { ...prev, isCompleted: true } : null
      );

      // Reset states
      setPendingVideoCompletion(null);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("[VideoCompletion] Error:", errorMsg);
      setErrorMessage(`Failed to complete video: ${errorMsg}. Please refresh and try again.`);
      setClaimStatus("error");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Initiate claim transaction
  const initiateClaimTransaction = async (video: VideoWithProgress) => {
    if (!address) {
      setErrorMessage("Wallet not connected");
      return;
    }

    // Check if on correct network
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      console.log("Wrong network, switching to Base Sepolia...");
      try {
        await switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
      } catch (error) {
        setErrorMessage("Please switch to Base Sepolia to claim rewards");
        return;
      }
    }

    // Reset previous transaction state
    resetWrite();
    setClaimTxHash(null);
    setClaimStatus("pending");
    setPendingVideoCompletion(video);

    try {
      console.log(`Initiating claim for ${video.reward_points_amount} OWT...`);
      
      // Convert points to token amount (1 point = 1 token with 18 decimals)
      const tokenAmount = parseEther(video.reward_points_amount.toString());
      
      // For now, we'll use a dummy signature since the backend signing isn't implemented yet
      // In production, you would get this signature from your backend API
      const dummySignature = "0x" + "00".repeat(65) as `0x${string}`;
      
      // Call the claim function on the smart contract
      writeContract({
        address: WATCH_REWARD_ADDRESS,
        abi: WATCH_REWARD_ABI,
        functionName: "claim",
        args: [tokenAmount, dummySignature],
      } as any); // Type assertion needed for wagmi v2
      
    } catch (error) {
      console.error("Error initiating claim:", error);
      setClaimStatus("error");
      setErrorMessage("Failed to initiate claim transaction");
      setPendingVideoCompletion(null);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Get profile ID from wallet (auto-create if doesn't exist)
  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      if (!address) return;
      let id = await getProfileByWallet(address);

      if (!id) {
        id = await ensureProfileExists(address);
      }

      if (id) {
        setProfileId(id);
        console.log("Profile ID set:", id);
      }
    };
    if (isConnected && address) {
      fetchOrCreateProfile();
    }
  }, [address, isConnected]);

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosData = await getAllRewardVideos();
        if (videosData) {
          if (profileId) {
            const videosWithProgress = await Promise.all(
              videosData.map(async (video) => {
                const progress = await getUserVideoProgress(
                  profileId,
                  video.id
                );
                return {
                  ...video,
                  progress,
                  isCompleted: progress?.is_completed || false,
                  watchedSeconds: progress?.last_watched_second || 0,
                };
              })
            );
            setVideos(videosWithProgress);
            // Don't set filteredVideos here - let the filter effect handle it
          } else {
            setVideos(videosData);
          }
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    if (profileId) {
      fetchVideos();
    }
  }, [profileId]);

  // Filter videos - runs after videos change or filter/search term changes
  useEffect(() => {
    let filtered = [...videos]; // Create a copy to avoid mutations

    if (filter !== "all") {
      filtered = filtered.filter((video) => video.category === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  }, [videos, filter, searchTerm]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if API already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      return;
    }

    // Load YouTube IFrame API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // API ready callback
    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API ready");
    };
  }, []);

  // Initialize YouTube Player when video selected
  useEffect(() => {
    if (!selectedVideo || !isWatching) {
      // Clean up player when closing
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log("Player cleanup error:", e);
        }
        playerRef.current = null;
      }
      return;
    }

    // Wait for YT API to load
    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new (window as any).YT.Player("youtube-player", {
        videoId: selectedVideo.youtube_id,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log("Player ready");
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            const playerState = event.data;
            // 1 = playing, 2 = paused
            if (playerState === 1) {
              startTracking();
            } else if (playerState === 2) {
              stopTracking();
            }
          },
        },
      });
    };

    initPlayer();

    return () => {
      stopTracking();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.log("Player cleanup error:", e);
        }
        playerRef.current = null;
      }
    };
  }, [selectedVideo, isWatching]);

  // Start tracking video progress
  const startTracking = () => {
    if (trackingIntervalRef.current) return;

    console.log("Starting video tracking...");

    // Update UI every 100ms with watched seconds
    trackingIntervalRef.current = setInterval(() => {
      if (!playerRef.current || !selectedVideo) return;

      try {
        const currentTime = playerRef.current.getCurrentTime();
        setWatchedSeconds(currentTime); // Update UI only with time, not full video object

        // Log progress every 5 seconds
        const progress =
          (currentTime / selectedVideo.required_duration_seconds) * 100;
        if (Math.floor(currentTime) % 5 === 0) {
          console.log(`Progress: ${progress.toFixed(1)}%`);
        }
      } catch (error) {
        console.error("Error getting current time:", error);
      }
    }, 100);

    // Sync to database every 10 seconds
    if (!dbSyncIntervalRef.current) {
      dbSyncIntervalRef.current = setInterval(async () => {
        if (!profileId || !selectedVideo || !playerRef.current) return;

        try {
          const currentTime = playerRef.current.getCurrentTime();
          const requiredDuration = selectedVideo.required_duration_seconds;
          const completionThreshold = requiredDuration * 0.8;

          console.log(
            `DB Sync: ${currentTime.toFixed(1)}s / ${requiredDuration}s (${(
              (currentTime / requiredDuration) *
              100
            ).toFixed(1)}%)`
          );

          // Update progress in database
          await updateVideoProgress(
            profileId,
            selectedVideo.id,
            Math.floor(currentTime)
          );

          // Check if video completed
          if (
            currentTime >= completionThreshold &&
            !selectedVideo.isCompleted
          ) {
            console.log("Video completed! Initiating on-chain claim...");
            stopTracking();

            // Trigger the on-chain claim transaction
            // The reward will be processed after tx confirmation
            initiateClaimTransaction(selectedVideo);
          }
        } catch (error) {
          console.error("Error syncing progress to DB:", error);
        }
      }, 10000);
    }
  };

  // Stop tracking
  const stopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
      console.log("Stopped UI tracking");
    }
    if (dbSyncIntervalRef.current) {
      clearInterval(dbSyncIntervalRef.current);
      dbSyncIntervalRef.current = null;
      console.log("Stopped DB sync");
    }
  };

  const handlePlayVideo = (video: VideoWithProgress) => {
    setSelectedVideo(video);
    setIsWatching(true);
  };

  const handleClosePlayer = () => {
    stopTracking();
    setWatchedSeconds(0); // Reset watched seconds
    setSelectedVideo(null);
    setIsWatching(false);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getYouTubeThumbnail = (youtubeId: string): string => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  const getProgressPercentage = (video: VideoWithProgress): number => {
    // Use watchedSeconds from state for currently playing video, otherwise use video.watchedSeconds
    const watched =
      selectedVideo?.id === video.id
        ? watchedSeconds
        : video.watchedSeconds || 0;
    if (!watched || !video.required_duration_seconds) return 0;
    return Math.min((watched / video.required_duration_seconds) * 100, 100);
  };

  const categories = Array.from(
    new Set(videos.map((v) => v.category).filter(Boolean))
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-white rounded-2xl border border-brand-green/12 shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/10">
            <Award className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-brand-ink mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-brand-ink/60">
            Please connect your wallet to watch videos and earn OWT
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-brand-ink mb-2">
            Watch &amp; Earn
          </h1>
          <p className="text-brand-ink/60">Watch videos and earn OWT tokens</p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-destructive/70 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-brand-ink/40" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white text-brand-ink placeholder:text-brand-ink/40 border border-brand-green/15 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-ink/50" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-white text-brand-ink border border-brand-green/15 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredVideos.map((video) => {
                const progressPercentage = getProgressPercentage(video);
                return (
                  <div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-white border border-brand-green/12 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="relative w-full aspect-video overflow-hidden bg-brand-green/5">
                      <img
                        src={getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-green/0 group-hover:bg-brand-green/30 transition-all duration-300">
                        <Play className="w-12 h-12 text-brand-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {video.isCompleted && (
                        <div className="absolute top-2 right-2 bg-brand-green text-brand-cream px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}

                      {progressPercentage > 0 && !video.isCompleted && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-green/10">
                          <div
                            className="h-full bg-brand-green transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-brand-ink mb-2 line-clamp-2">
                        {video.title}
                      </h3>

                      <div className="flex items-center justify-between text-sm text-brand-ink/60 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(video.required_duration_seconds)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          {video.reward_points_amount} OWT
                        </div>
                      </div>

                      {progressPercentage > 0 && !video.isCompleted && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-brand-ink/60">Progress</span>
                            <span className="text-brand-green font-semibold">
                              {Math.floor(progressPercentage)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-brand-green/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-green transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <button className="w-full py-2.5 px-4 rounded-full bg-brand-green hover:bg-brand-green-700 text-brand-cream font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        {video.isCompleted ? "Rewatch" : "Watch"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 mx-auto text-brand-ink/30 mb-4" />
                <p className="text-brand-ink/60 text-lg">No videos found</p>
              </div>
            )}
          </>
        )}

        {selectedVideo && (
          <div className="fixed inset-0 bg-brand-ink/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-brand-green/12">
              <div className="flex justify-between items-center p-4 bg-white border-b border-brand-green/12">
                <h2 className="font-display font-semibold text-brand-ink">
                  {selectedVideo.title}
                </h2>
                <button
                  onClick={handleClosePlayer}
                  className="text-brand-ink/50 hover:text-brand-ink transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative w-full bg-black aspect-video">
                {/* YouTube Player will be embedded here by YouTube IFrame API */}
                <div id="youtube-player" className="w-full h-full" />
              </div>

              <div className="bg-white p-4 border-t border-brand-green/12">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-brand-ink font-medium">
                    {formatDuration(Math.floor(watchedSeconds || 0))} /{" "}
                    {formatDuration(selectedVideo.required_duration_seconds)}
                  </span>
                  <span className="text-brand-green font-bold">
                    {Math.floor(getProgressPercentage(selectedVideo))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-brand-green/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-green transition-all duration-300"
                    style={{
                      width: `${getProgressPercentage(selectedVideo)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-brand-ink/60 mt-3">
                  Watch at least 80% of the video to earn{" "}
                  <span className="text-brand-green font-semibold">
                    {selectedVideo.reward_points_amount} OWT
                  </span>{" "}
                  tokens
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Claim Transaction Modal */}
        {(claimStatus === "pending" || claimStatus === "confirming") && (
          <div className="fixed inset-0 bg-brand-ink/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-brand-green/15 shadow-2xl">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Wallet className="w-16 h-16 text-brand-green" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-24 h-24 text-brand-green animate-spin opacity-20" />
                  </div>
                </div>
              </div>

              <h2 className="font-display text-2xl font-semibold text-brand-ink mb-2">
                {claimStatus === "pending" ? "Confirm Transaction" : "Processing Claim"}
              </h2>
              <p className="text-brand-ink/60 mb-6">
                {claimStatus === "pending"
                  ? "Please confirm the transaction in your wallet"
                  : "Waiting for blockchain confirmation..."}
              </p>

              {claimTxHash && (
                <div className="bg-brand-cream rounded-lg p-4 mb-6 border border-brand-green/15">
                  <p className="text-brand-ink/60 text-sm mb-2">Transaction Hash</p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${claimTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green hover:text-brand-green-700 text-sm font-mono flex items-center justify-center gap-2"
                  >
                    {claimTxHash.slice(0, 10)}...{claimTxHash.slice(-8)}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-brand-ink/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {claimStatus === "pending"
                    ? "Waiting for wallet confirmation..."
                    : "Confirming on Base..."}
                </span>
              </div>
            </div>
          </div>
        )}

        {showRewardModal && (
          <div className="fixed inset-0 bg-brand-ink/70 flex items-center justify-center z-50 p-4">
            <div className="bg-brand-green text-brand-cream rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Trophy className="w-20 h-20 text-amber-300 animate-bounce" />
                  <div className="absolute inset-0 bg-amber-300 rounded-full opacity-20 animate-pulse" />
                </div>
              </div>

              <h2 className="font-display text-3xl font-semibold mb-2">
                Congratulations!
              </h2>
              <p className="text-brand-cream/70 mb-6">
                You completed the video and claimed your reward!
              </p>

              <div className="bg-brand-cream/10 rounded-lg p-4 mb-6 border border-brand-cream/20">
                <p className="text-brand-cream/70 text-sm mb-1">OWT Tokens Earned</p>
                <p className="font-display text-4xl font-semibold text-brand-cream">
                  +{earnedPoints} OWT
                </p>
                <p className="text-xs text-brand-cream/60 mt-2">
                  Tokens sent to your wallet
                </p>
              </div>

              {claimTxHash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${claimTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 text-brand-cream/80 hover:text-brand-cream text-sm flex items-center justify-center gap-2"
                >
                  View transaction on BaseScan
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                onClick={() => {
                  setShowRewardModal(false);
                  setSelectedVideo(null);
                  setClaimStatus("idle");
                  setClaimTxHash(null);
                  resetWrite();
                }}
                className="w-full py-3 px-6 rounded-full bg-brand-cream text-brand-green hover:bg-white font-semibold transition-colors duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
