"use client";

import { useState } from "react";
import { Play, Menu, X, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { useLenis } from "@/components/providers/LenisProvider";

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { disconnect } = useDisconnect();
  const lenis = useLenis();

  const scrollToSection = (sectionId: string) => {
    lenis?.scrollTo(`#${sectionId}`, { duration: 1.2, offset: -80 });
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", onClick: () => scrollToSection("hero") },
    { label: "How It Works", onClick: () => scrollToSection("how-it-works") },
    { label: "Features", onClick: () => scrollToSection("features") },
    {
      label: "Docs",
      onClick: () =>
        window.open("https://owatch-1.gitbook.io/owatch-docs", "_blank"),
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-brand-ink">
            O&apos;Watch
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop Wallet */}
        <div className="hidden md:block">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => (
              <div
                {...(!mounted && {
                  "aria-hidden": true,
                  style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                })}
              >
                {(() => {
                  if (!mounted || !account || !chain) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                        type="button"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </button>
                    );
                  }
                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                        type="button"
                      >
                        Wrong network
                      </button>
                    );
                  }
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openAccountModal}
                        className="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
                        type="button"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        {account.displayName}
                      </button>
                      <button
                        onClick={() => disconnect()}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                        type="button"
                        title="Disconnect"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </ConnectButton.Custom>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-gray-500 md:hidden hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="text-left text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2">
              <ConnectButton.Custom>
                {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => (
                  <div
                    {...(!mounted && {
                      "aria-hidden": true,
                      style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                    })}
                  >
                    {(() => {
                      if (!mounted || !account || !chain) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
                            type="button"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet
                          </button>
                        );
                      }
                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                            type="button"
                          >
                            Wrong network
                          </button>
                        );
                      }
                      return (
                        <div className="w-full space-y-2">
                          <button
                            onClick={openAccountModal}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
                            type="button"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            {account.displayName}
                          </button>
                          <button
                            onClick={() => disconnect()}
                            className="w-full rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600"
                            type="button"
                          >
                            Disconnect
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
