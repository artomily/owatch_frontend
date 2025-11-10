"use client";

import { useWalletRedirect } from "@/hooks/useWalletRedirect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Play,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "./LandingNavbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function LandingPage(): JSX.Element {
  // This hook handles auto-redirect when wallet connects/disconnects
  useWalletRedirect();

  const features = [
    {
      icon: <Eye className="h-8 w-8 text-purple-500" />,
      title: "Watch to Earn",
      description:
        "Earn OWATCH tokens by watching engaging video content across various categories.",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: "Real Rewards",
      description:
        "Convert your viewing time into real cryptocurrency rewards that you can withdraw anytime.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
      title: "Track Progress",
      description:
        "Monitor your earnings, watch time, and progress through detailed analytics and charts.",
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: "Community",
      description:
        "Join thousands of users earning rewards while staying updated with the latest content.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Secure",
      description:
        "Built on blockchain technology with secure wallet integration and transparent rewards.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Instant Rewards",
      description:
        "Earn tokens in real-time as you watch, with instant updates to your balance.",
    },
  ];

  const stats = [
    {
      label: "Total Users",
      value: "50K+",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Tokens Distributed",
      value: "2.5M",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: "Hours Watched",
      value: "1M+",
      icon: <Play className="h-5 w-5" />,
    },
    {
      label: "Active Creators",
      value: "500+",
      icon: <Eye className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Modern Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.3)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/10 to-transparent"></div>
      </div>

      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <section id="hero" className="relative z-10 px-4 py-24 pt-64">
        <div className="max-w-5xl mx-auto text-center">
          {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-300 text-sm font-medium mb-8">
            🎉 Now in Beta - Start earning today
          </div> */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Watch Videos,{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Earn Crypto
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your viewing time into cryptocurrency rewards with
            O'Watch.ID. Join thousands of users earning OWATCH tokens while
            enjoying premium content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto px-4 sm:px-0">
            <div className="w-full sm:w-auto">
              <ConnectButton
                label="Connect Wallet & Start"
                showBalance={false}
              />
            </div>
            <a
              href="https://owatch-1.gitbook.io/owatch-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-transparent rounded-xl font-semibold backdrop-blur-sm transition-all duration-200 flex items-center justify-center"
            >
              Read Our Docs
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-md border border-white/10 text-center hover:bg-white/10 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3 text-purple-400 group-hover:text-purple-300 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose O'Watch.ID?
            </h3>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of content consumption with
              built-in rewards and blockchain technology.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
              >
                <CardHeader className="pb-4">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h3>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Simple steps to start earning with O'Watch.ID
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Connect Wallet
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Link your crypto wallet to securely receive OWATCH token
                rewards.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Watch Content
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Browse and watch videos from various categories including
                crypto, tech, and gaming.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                Earn Rewards
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Automatically earn OWATCH tokens as you watch, track progress,
                and withdraw anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-300">
            <CardContent className="p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h3>
              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
                Join thousands of users who are already earning cryptocurrency
                by watching their favorite content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="inline-flex">
                  <ConnectButton
                    label="Connect Wallet & Start Earning"
                    showBalance={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">O'Watch.ID</span>
            </div>
            <div className="flex space-x-8 text-slate-400">
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors font-medium"
              >
                Support
              </a>
              <a
                href="https://owatch-1.gitbook.io/owatch-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors font-medium"
              >
                Documentation
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-slate-400">
            <p className="leading-relaxed">
              &copy; {new Date().getFullYear()} O'Watch.ID. All rights reserved.
              Built on blockchain technology for the future of entertainment.
            </p>
          </div>
        </div>
      </footer>

      {/* Modern Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>

        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-3000"></div>
      </div>
    </div>
  );
}
