export const APP_NAME = "Ascend Distributions";
export const COMPANY_NAME = "Ascend Systems LLC";
export const APP_DESCRIPTION =
  "Upload once. Release everywhere. Keep more of your royalties.";

export const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/releases", label: "My Releases", icon: "Disc3" },
  { href: "/dashboard/upload", label: "Upload Music", icon: "Upload" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/dashboard/royalties", label: "Royalties", icon: "DollarSign" },
  { href: "/dashboard/payouts", label: "Payouts", icon: "Wallet" },
  { href: "/dashboard/profile", label: "Profile", icon: "User" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/releases", label: "Releases", icon: "Disc3" },
  { href: "/admin/revenue", label: "Revenue", icon: "DollarSign" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "CreditCard" },
  { href: "/admin/payouts", label: "Payouts", icon: "Wallet" },
  { href: "/admin/reports", label: "Reports", icon: "FileText" },
] as const;

export const FEATURES = [
  {
    title: "Worldwide Distribution",
    description: "Reach 150+ streaming platforms and stores across the globe.",
    icon: "Globe",
  },
  {
    title: "Analytics Dashboard",
    description: "Real-time streaming data, audience insights, and performance metrics.",
    icon: "BarChart3",
  },
  {
    title: "Royalty Tracking",
    description: "Transparent royalty splits with detailed per-track revenue breakdowns.",
    icon: "DollarSign",
  },
  {
    title: "Fast Releases",
    description: "Get your music live on all platforms in as little as 24-48 hours.",
    icon: "Zap",
  },
  {
    title: "Artist Profiles",
    description: "Build your brand with customizable public artist profiles.",
    icon: "User",
  },
  {
    title: "Team Management",
    description: "Collaborate with your label, manager, or band members seamlessly.",
    icon: "Users",
  },
  {
    title: "Revenue Reports",
    description: "Export detailed CSV and PDF reports for accounting and taxes.",
    icon: "FileText",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "How does Ascend Distributions work?",
    answer:
      "Upload your music once through our dashboard, and we distribute it to 150+ streaming platforms including Spotify, Apple Music, YouTube Music, and more. You keep track of streams, royalties, and payouts all in one place.",
  },
  {
    question: "What file formats do you accept?",
    answer:
      "We accept WAV, FLAC, and MP3 audio files. Artwork must be at least 3000x3000 pixels in JPG or PNG format.",
  },
  {
    question: "How long does distribution take?",
    answer:
      "Most releases go live within 24-48 hours after approval. Some platforms may take up to 5 business days.",
  },
  {
    question: "What royalty split do I get?",
    answer:
      "Free plan: 80/20 split. Standard plan ($5/mo): 90/10 split. Pro plan ($10/mo): keep 100% of your royalties.",
  },
  {
    question: "What is the minimum payout amount?",
    answer:
      "The minimum withdrawal amount is $1. Payouts are available via PayPal or bank transfer.",
  },
  {
    question: "Can I schedule releases in advance?",
    answer:
      "Yes! Release scheduling is available on Standard and Pro plans. Set your release date and we'll handle the rest.",
  },
  {
    question: "Do you take ownership of my music?",
    answer:
      "Never. You retain 100% ownership of your music. Ascend Distributions is a distribution service only.",
  },
  {
    question: "How do I upgrade my plan?",
    answer:
      "Visit your Settings page or the Pricing page to upgrade. Changes take effect immediately and are prorated.",
  },
] as const;

export const DISTRIBUTION_PLATFORMS = [
  { name: "Spotify", color: "#1DB954" },
  { name: "Apple Music", color: "#FC3C44" },
  { name: "YouTube Music", color: "#FF0000" },
  { name: "TikTok", color: "#00F2EA" },
  { name: "Amazon Music", color: "#FF9900" },
  { name: "Pandora", color: "#005483" },
  { name: "Deezer", color: "#FEAA2D" },
  { name: "Tidal", color: "#000000" },
  { name: "iHeartRadio", color: "#C6002B" },
  { name: "SoundCloud", color: "#FF5500" },
  { name: "Instagram", color: "#E4405F" },
  { name: "Beatport", color: "#94D500" },
] as const;

export const STATS = [
  { value: "150+", label: "Platforms" },
  { value: "24hr", label: "Avg. Release Time" },
  { value: "100%", label: "You Own Your Music" },
  { value: "$0", label: "To Get Started" },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload Your Music",
    description: "Drop your WAV, FLAC, or MP3 files with artwork and metadata. Our smart validator catches issues before submission.",
  },
  {
    step: "02",
    title: "We Distribute Everywhere",
    description: "Your release goes to 150+ platforms — Spotify, Apple Music, TikTok, and every major store worldwide.",
  },
  {
    step: "03",
    title: "Track & Get Paid",
    description: "Watch streams roll in on your analytics dashboard. Withdraw royalties anytime — minimum payout just $1.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote: "Ascend Distributions changed how I release music. The dashboard feels like Spotify for Artists meets a premium SaaS product.",
    author: "Marcus V.",
    role: "Independent Artist",
    streams: "2.4M streams",
  },
  {
    quote: "Finally a distributor that doesn't look like it was built in 2010. Upload to live in 24 hours — no middleman, no BS.",
    author: "Luna Reyes",
    role: "Producer & Songwriter",
    streams: "890K streams",
  },
  {
    quote: "The royalty transparency alone is worth it. I can see exactly what every track earns across every platform.",
    author: "DJ Kairo",
    role: "Electronic Artist",
    streams: "5.1M streams",
  },
  {
    quote: "We switched our entire label roster to Ascend. Team management and release scheduling are game changers.",
    author: "Northline Records",
    role: "Independent Label",
    streams: "12M+ streams",
  },
] as const;

export const COMPARISON = {
  ascend: [
    "Start free, upgrade when ready",
    "Keep up to 100% royalties",
    "Premium analytics dashboard",
    "Release in 24-48 hours",
    "Modern artist community",
    "Glass-clear royalty reports",
  ],
  others: [
    "Pay upfront before uploading",
    "Hidden fees and splits",
    "Basic stats only",
    "1-2 week delivery times",
    "No community features",
    "Spreadsheet royalty exports",
  ],
} as const;
