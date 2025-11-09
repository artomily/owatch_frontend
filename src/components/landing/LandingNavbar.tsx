"use client";

import { useState } from "react";
import { Play, Menu, X, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

interface LandingNavbarProps {
  // Reserved for future use
}

export function LandingNavbar({}: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { disconnect } = useDisconnect();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", onClick: () => scrollToSection("hero") },
    { label: "How It Works", onClick: () => scrollToSection("how-it-works") },
    // { label: "Features", onClick: () => scrollToSection("features") },
  ];

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 shadow-xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">O'Watch.ID</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Connect Wallet Button - Desktop */}
          <div className="hidden md:block">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                return (
                  <div
                    {...(!mounted && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!mounted || !account || !chain) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center"
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
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg flex items-center"
                            type="button"
                          >
                            Wrong network
                          </button>
                        );
                      }

                      // Chain check disabled temporarily
                      // if (chain.unsupported) {
                      //   return (
                      //     <button
                      //       onClick={openChainModal}
                      //       className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg flex items-center"
                      //       type="button"
                      //     >
                      //       Wrong network
                      //     </button>
                      //   );
                      // }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openAccountModal}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center"
                            type="button"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            {account.displayName}
                          </button>
                          <div className="relative group">
                            <button
                              onClick={() => disconnect()}
                              className="text-slate-300 hover:text-white transition-colors p-2 text-xs font-medium hover:bg-red-500/20 rounded"
                              type="button"
                              title="Disconnect wallet"
                            >
                              ×
                            </button>
                            <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-slate-800 text-white text-xs px-3 py-1 rounded whitespace-nowrap z-50">
                              Disconnect
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-col space-y-3">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium text-left"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    return (
                      <div
                        {...(!mounted && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                          },
                        })}
                      >
                        {(() => {
                          if (!mounted || !account || !chain) {
                            return (
                              <button
                                onClick={openConnectModal}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center"
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
                                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center"
                                type="button"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          // Chain check disabled temporarily
                          // if (chain.unsupported) {
                          //   return (
                          //     <button
                          //       onClick={openChainModal}
                          //       className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center"
                          //       type="button"
                          //     >
                          //       Wrong network
                          //     </button>
                          //   );
                          // }

                          return (
                            <div className="space-y-2 w-full">
                              <button
                                onClick={openAccountModal}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 text-sm rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center"
                                type="button"
                              >
                                <Wallet className="mr-2 h-4 w-4" />
                                {account.displayName}
                              </button>
                              <button
                                onClick={() => disconnect()}
                                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 text-sm rounded-lg font-semibold transition-all border border-red-500/30"
                                type="button"
                              >
                                Disconnect Wallet
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
