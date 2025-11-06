"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
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

interface VideoWithProgress extends RewardVideo {
  progress?: UserVideoProgress | null;
  isCompleted?: boolean;
  watchedSeconds?: number;
}

export function VideoContent(): JSX.Element {
  const { address, isConnected } = useAccount();

  // State
  const [videos, setVideos] = useState<VideoWithProgress[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoWithProgress[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProgress | null>(
    null
  );
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isWatching, setIsWatching] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // YouTube iframe refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Get profile ID from wallet
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) return;
      const id = await getProfileByWallet(address);
      if (id) setProfileId(id);
    };
    if (isConnected && address) {
      fetchProfile();
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
            setFilteredVideos(videosWithProgress);
          } else {
            setVideos(videosData);
            setFilteredVideos(videosData);
          }
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [profileId]);

  // Filter videos
  useEffect(() => {
    let filtered = videos;
    if (filter !== "all") {
      filtered = filtered.filter((video) => video.category === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredVideos(filtered);
  }, [filter, searchTerm, videos]);

  // Track video progress
  useEffect(() => {
    if (!isWatching || !selectedVideo || !profileId) return;
    progressInterval.current = setInterval(async () => {
      try {
        const currentTime = (selectedVideo.watchedSeconds || 0) + 10;
        await updateVideoProgress(profileId, selectedVideo.id, currentTime);
        const requiredDuration = selectedVideo.required_duration_seconds;
        const completionThreshold = requiredDuration * 0.8;
        if (currentTime >= completionThreshold && !selectedVideo.isCompleted) {
          const result = await completeVideo(profileId, selectedVideo.id);
          if (result) {
            setEarnedPoints(selectedVideo.reward_points_amount);
            setShowRewardModal(true);
            setIsWatching(false);
            setVideos((prev) =>
              prev.map((v) =>
                v.id === selectedVideo.id ? { ...v, isCompleted: true } : v
              )
            );
          }
        }
        setSelectedVideo((prev) =>
          prev ? { ...prev, watchedSeconds: currentTime } : null
        );
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }, 10000);
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isWatching, selectedVideo, profileId]);

  const handlePlayVideo = (video: VideoWithProgress) => {
    setSelectedVideo(video);
    setIsWatching(true);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    setIsWatching(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getYouTubeEmbedUrl = (youtubeId: string): string => {
    return `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${
      typeof window !== "undefined" ? window.location.origin : ""
    }`;
  };

  const getYouTubeThumbnail = (youtubeId: string): string => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  const getProgressPercentage = (video: VideoWithProgress): number => {
    if (!video.watchedSeconds || !video.required_duration_seconds) return 0;
    return Math.min(
      (video.watchedSeconds / video.required_duration_seconds) * 100,
      100
    );
  };

  const categories = Array.from(
    new Set(videos.map((v) => v.category).filter(Boolean))
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
          <Award className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to start watching videos and earning
            rewards
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">
          🎬 Reward Videos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Watch videos and earn points. Complete 80% to claim your reward!
        </p>
      </div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
            onClick={() => handlePlayVideo(video)}
          >
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
              <img
                src={
                  video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)
                }
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getYouTubeThumbnail(video.youtube_id);
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-purple-600 rounded-full p-4">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
              {video.isCompleted && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
              {!video.isCompleted &&
                video.watchedSeconds &&
                video.watchedSeconds > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600">
                    <div
                      className="h-full bg-purple-600"
                      style={{ width: `${getProgressPercentage(video)}%` }}
                    />
                  </div>
                )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 dark:text-white line-clamp-2">
                {video.title}
              </h3>
              {video.category && (
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 mb-2">
                  {video.category}
                </span>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(video.required_duration_seconds)}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                  <Trophy className="w-4 h-4" />
                  <span>{video.reward_points_amount} pts</span>
                </div>
              </div>
              {!video.isCompleted &&
                video.watchedSeconds &&
                video.watchedSeconds > 0 && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Watched: {formatDuration(video.watchedSeconds)} /{" "}
                    {formatDuration(video.required_duration_seconds)}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 dark:text-white">
            No videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or search term
          </p>
        </div>
      )}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white line-clamp-1">
                {selectedVideo.title}
              </h2>
              <button
                onClick={handleClosePlayer}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <iframe
                ref={iframeRef}
                src={getYouTubeEmbedUrl(selectedVideo.youtube_id)}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatDuration(selectedVideo.required_duration_seconds)}
                    </span>
                  </div>
                  {selectedVideo.category && (
                    <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {selectedVideo.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-lg">
                  <Trophy className="w-5 h-5" />
                  <span>{selectedVideo.reward_points_amount} Points</span>
                </div>
              </div>
              {!selectedVideo.isCompleted && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Watch progress (need 80% to claim reward)
                    </span>
                    <span className="font-semibold dark:text-white">
                      {getProgressPercentage(selectedVideo).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{
                        width: `${getProgressPercentage(selectedVideo)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {selectedVideo.isCompleted && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-semibold">
                    You&apos;ve completed this video and earned{" "}
                    {selectedVideo.reward_points_amount} points!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <Award className="w-20 h-20 mx-auto text-yellow-500 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold mb-2 dark:text-white">
              Congratulations! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You&apos;ve earned
            </p>
            <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-6">
              {earnedPoints} Points
            </div>
            <button
              onClick={() => {
                setShowRewardModal(false);
                handleClosePlayer();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
