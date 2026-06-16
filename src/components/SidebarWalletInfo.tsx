"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, LogOut, Copy } from "lucide-react";

export function SidebarWalletInfo() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setShowMenu(false);
      // You could add a toast notification here
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={openConnectModal}
            className="w-full bg-brand-green hover:bg-brand-green-700 text-brand-cream rounded-full px-4 py-3 font-medium transition-colors duration-200"
          >
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-brand-green/15 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
          <div>
            <p className="text-xs text-brand-ink/50">Wallet</p>
            <p className="text-sm font-medium text-brand-ink">
              {address ? formatWalletAddress(address) : "Connected"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-lg hover:bg-brand-green/8 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-brand-ink/50" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-brand-green/15 shadow-lg z-50"
        >
          <div className="py-2">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-brand-ink/70 hover:bg-brand-green/8 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Address</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
