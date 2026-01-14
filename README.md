# O'Watch.ID - Watch to Earn Platform

<div align="center">
  
  ![O'Watch.ID](https://img.shields.io/badge/O'Watch.ID-Web3-purple?style=for-the-badge)
  ![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

**Transform your viewing time into cryptocurrency rewards**

[Documentation](https://owatch-1.gitbook.io/owatch-docs) • [Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📖 About The Project

O'Watch.ID is a revolutionary Web3 platform that rewards users with OWATCH tokens for watching engaging video content. Built on blockchain technology with secure wallet integration, O'Watch.ID transforms passive content consumption into an active earning opportunity.

### ✨ Key Features

- 🎥 **Watch to Earn** - Earn OWATCH tokens by watching videos across various categories
- 💰 **Real Rewards** - Convert viewing time into cryptocurrency that you can withdraw anytime
- 📊 **Track Progress** - Monitor earnings, watch time, and progress through detailed analytics
- 👥 **Community Driven** - Join thousands of users earning rewards together
- 🔒 **Secure & Transparent** - Built on blockchain with secure wallet integration
- ⚡ **Instant Rewards** - Real-time token earnings with instant balance updates

---

## 🚀 Tech Stack

### Frontend Framework

- **Next.js 14** - React framework with App Router
- **React 18.3** - UI library
- **TypeScript** - Type-safe development

### Blockchain Integration

- **wagmi 2.18** - React hooks for Ethereum
- **viem 2.38** - TypeScript interface for Ethereum
- **RainbowKit 2.2** - Beautiful wallet connection UI
- **Mantle & Mantle Testnet** - Layer 2 blockchain networks

### Styling

- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Beautiful icon library
- **class-variance-authority** - Component variant management

### State Management

- **TanStack Query** - Powerful data synchronization

---

## 📁 Project Structure

```
owatch/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/           # Dashboard routes
│   │   │   ├── convert/         # Token conversion page
│   │   │   ├── profile/         # User profile
│   │   │   ├── settings/        # Settings page
│   │   │   └── videos/          # Video content page
│   │   ├── landing/             # Landing page route
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   │
│   ├── components/              # Reusable components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── landing/             # Landing page components
│   │   ├── layout/              # Layout components
│   │   ├── ui/                  # UI primitives
│   │   └── WalletProvider.tsx   # Wallet connection provider
│   │
│   ├── context/                 # React contexts
│   │   ├── SidebarContext.tsx   # Sidebar state
│   │   ├── ThemeContext.tsx     # Theme management
│   │   └── WalletContext.tsx    # Wallet state
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useWalletRedirect.ts # Wallet redirect logic
│   │
│   ├── lib/                     # Library configurations
│   │   ├── wagmi.ts            # Wagmi & RainbowKit config
│   │   └── utils.ts            # Utility functions
│   │
│   └── types/                   # TypeScript type definitions
│
├── public/                      # Static assets
├── eslint.config.js            # ESLint configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
└── package.json                # Dependencies
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Git**
- A **WalletConnect Project ID** (get one at [WalletConnect Cloud](https://cloud.walletconnect.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/artomily/owatch.git
   cd owatch
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 Usage

### Connecting Your Wallet

1. Click **"Connect Wallet"** on the landing page
2. Select your preferred wallet (MetaMask, WalletConnect, Coinbase Wallet, etc.)
3. Approve the connection in your wallet
4. You'll be automatically redirected to the dashboard

### Watching Videos & Earning

1. Navigate to the **Videos** section from the dashboard
2. Browse available video content
3. Start watching videos to earn OWATCH tokens
4. Track your earnings in real-time on your profile

### Managing Your Tokens

1. View your token balance in the sidebar
2. Go to **Convert** to swap or withdraw tokens
3. Check your transaction history in **Profile**

---

## 🎨 Features Breakdown

### Landing Page

- Modern gradient background with animated effects
- Responsive navigation bar with wallet integration
- Hero section with call-to-action
- Feature showcase cards
- Stats section displaying platform metrics
- "How It Works" step-by-step guide
- Footer with documentation links

### Dashboard

- Responsive sidebar with wallet information
- Video content grid with filtering
- User profile with earnings history
- Token conversion interface
- Settings and preferences
- Mobile-responsive navigation

### Wallet Integration

- Multi-wallet support via RainbowKit
- Automatic connection state management
- Network switching (Mantle & Mantle Testnet)
- Persistent wallet sessions
- Secure authentication

---

## 🌐 Supported Networks

- **Mantle** - Layer 2 Mainnet
- **Mantle Testnet** - Layer 2 Testnet (for development)

---

## 📚 Documentation

For detailed documentation, visit our [GitBook Documentation](https://owatch-1.gitbook.io/owatch-docs)

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 🔧 Configuration

### Wagmi & RainbowKit

The wallet configuration is located in `src/lib/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: "O'Watch.ID",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [mantle, mantleTestnet],
  ssr: true,
});
```

### Tailwind CSS

Custom theme configuration in `tailwind.config.js` with:

- Custom color palette
- Dark mode support
- Extended utilities for animations

---

## 🐛 Known Issues

- None currently reported

---

## 🗺️ Roadmap

- [ ] Enhanced video player with playback controls
- [ ] NFT rewards for top viewers
- [ ] Creator monetization features
- [ ] Mobile app (iOS & Android)
- [ ] Multi-chain support
- [ ] Advanced analytics dashboard
- [ ] Social features & community chat

---

## 📄 License

This project is proprietary and confidential.

---

## 👤 Author

**O'Watch.ID Team**

- GitHub: [@artomily](https://github.com/artomily)
- Documentation: [owatch-docs](https://owatch-1.gitbook.io/owatch-docs)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Wagmi](https://wagmi.sh/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Mantle](https://www.mantle.xyz/)

---

<div align="center">
  
  **Built with ❤️ on blockchain technology for the future of entertainment**
  
  [⬆ Back to Top](#owatch-id---watch-to-earn-platform)
  
</div>
