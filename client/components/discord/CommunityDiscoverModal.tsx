import React, { useEffect, useMemo, useState } from 'react';

export type DiscoverTab = 'volume' | 'gainers' | 'losers' | 'new';

export interface CommunityItem {
  id: string;
  name: string;
  symbol?: string; // Crypto symbol (BTC, ETH, etc.)
  iconUrl: string;
  description?: string;
  membersCount?: number;
  tags?: string[];
  createdAt?: number;
  score?: number; // popularity
  price?: number; // Current price in USD
  priceChange24h?: number; // 24h price change percentage
  volume24h?: number; // 24h trading volume in USD
  marketCap?: number; // Market cap in USD
}

const CATALOG: CommunityItem[] = [
  { id: 'nano', name: 'Nanotech', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Research breakthroughs and applications', membersCount: 12150, tags: ['science','tech'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20, score: 97 },
  { id: 'welcome', name: 'Welcome', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Rules and key links', membersCount: 19123, tags: ['general'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 200, score: 90 },
  { id: 'authors', name: "Author's Blog", iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Posts from the author and discussions', membersCount: 5320, tags: ['writing'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, score: 88 },
  { id: 'ai-lab', name: 'AI Lab', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Models, prompts, and tooling', membersCount: 16400, tags: ['ai','ml'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40, score: 99 },
  { id: 'crypto', name: 'Crypto Builders', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'On-chain dev and markets', membersCount: 9800, tags: ['crypto'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, score: 92 },
  { id: 'defi', name: 'DeFi Developers', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Protocols, audits and tooling', membersCount: 8700, tags: ['crypto','dev'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, score: 91 },
  { id: 'gaming', name: 'Indie Gaming', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Game design and devlogs', membersCount: 7400, tags: ['games','dev'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60, score: 84 },
  { id: 'traders', name: 'Pro Traders', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Markets, TA and news', membersCount: 22000, tags: ['markets'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, score: 96 },
  { id: 'startups', name: 'Startups', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Founders and builders', membersCount: 13200, tags: ['business'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90, score: 89 },
  { id: 'designers', name: 'Designers Hub', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'UI/UX critiques and tips', membersCount: 10500, tags: ['design'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35, score: 87 },
  { id: 'photo', name: 'Photography', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Gear, edits and shoots', membersCount: 6200, tags: ['art'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12, score: 82 },
  { id: 'music', name: 'Music Producers', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'DAWs, samples and feedback', membersCount: 8800, tags: ['music'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25, score: 85 },
  { id: 'bio', name: 'Health & Bio', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Longevity, biotech, research', membersCount: 5400, tags: ['science'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18, score: 83 },
  { id: 'space', name: 'Space Nerds', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Rockets and missions', membersCount: 7700, tags: ['science'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 70, score: 86 },
  { id: 'climate', name: 'Climate Tech', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Energy and sustainability', membersCount: 6900, tags: ['tech'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8, score: 88 },
  { id: 'robotics', name: 'Robotics Lab', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Automation and AI robots', membersCount: 4200, tags: ['tech','ai'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, score: 81 },
  { id: 'marketing', name: 'Growth Marketing', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'SEO, ads and growth hacks', membersCount: 9100, tags: ['business'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22, score: 84 },
  { id: 'legal', name: 'Legal Tech', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Law, compliance and contracts', membersCount: 3800, tags: ['business'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45, score: 79 },
  { id: 'vr', name: 'VR/AR Creators', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Metaverse and immersive tech', membersCount: 5600, tags: ['tech','games'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, score: 86 },
  { id: 'fitness', name: 'Fitness & Wellness', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Workouts, nutrition and health', membersCount: 11200, tags: ['health'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28, score: 87 },
  { id: 'education', name: 'EdTech Innovators', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Online learning and courses', membersCount: 7800, tags: ['education'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 16, score: 82 },
  { id: 'fashion', name: 'Fashion Designers', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Style, trends and collections', membersCount: 6500, tags: ['art','design'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 11, score: 80 },
  { id: 'food', name: 'Food & Cooking', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Recipes, techniques and reviews', membersCount: 14300, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, score: 91 },
  { id: 'travel', name: 'Travel Community', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Destinations, tips and stories', membersCount: 10900, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 19, score: 85 },
  { id: 'books', name: 'Book Club', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Reading lists and discussions', membersCount: 8200, tags: ['writing'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 33, score: 83 },
  { id: 'pets', name: 'Pet Lovers', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Pet care, training and photos', membersCount: 12800, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9, score: 89 },
  { id: 'sustainability', name: 'Sustainable Living', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Eco-friendly lifestyle and tips', membersCount: 5900, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13, score: 81 },
  { id: 'real-estate', name: 'Real Estate Investors', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Property investment strategies', membersCount: 7100, tags: ['business'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 27, score: 82 },
  { id: 'blockchain', name: 'Blockchain Devs', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Smart contracts and dApps', membersCount: 8900, tags: ['crypto','dev'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, score: 85 },
  { id: 'animation', name: '3D Animation', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Blender, Maya and rendering', membersCount: 5100, tags: ['art','design'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 21, score: 78 },
  { id: 'mental-health', name: 'Mental Health', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Support and wellness tips', membersCount: 9400, tags: ['health'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 17, score: 86 },
  { id: 'finance', name: 'Personal Finance', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Budgeting, saving and investing', membersCount: 11800, tags: ['business'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 23, score: 88 },
  { id: 'cybersecurity', name: 'Cybersecurity', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Ethical hacking and security', membersCount: 6700, tags: ['tech'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 31, score: 83 },
  { id: 'video-editing', name: 'Video Editors', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Premiere, Final Cut and effects', membersCount: 7900, tags: ['media'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, score: 84 },
  { id: 'parenting', name: 'Modern Parents', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Parenting tips and support', membersCount: 8500, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 26, score: 82 },
  { id: 'automotive', name: 'Car Enthusiasts', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Cars, mods and mechanics', membersCount: 9700, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, score: 85 },
  { id: 'gardening', name: 'Urban Gardening', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Plants, growing and tips', membersCount: 4900, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 29, score: 77 },
  { id: 'podcasting', name: 'Podcasters', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Audio production and hosting', membersCount: 5300, tags: ['media'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 24, score: 79 },
  { id: 'languages', name: 'Language Learning', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Polyglots and practice', membersCount: 10200, tags: ['education'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 36, score: 86 },
  { id: 'architecture', name: 'Architecture', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Building design and urbanism', membersCount: 4600, tags: ['design'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 41, score: 76 },
  { id: 'drones', name: 'Drone Pilots', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Aerial photography and tech', membersCount: 5800, tags: ['tech'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12, score: 80 },
  { id: 'quantum', name: 'Quantum Computing', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Qubits and algorithms', membersCount: 3200, tags: ['science','tech'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 47, score: 75 },
  { id: 'astronomy', name: 'Amateur Astronomy', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Telescopes and stargazing', membersCount: 6100, tags: ['science'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 38, score: 81 },
  { id: 'esports', name: 'Esports Arena', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Competitive gaming and teams', membersCount: 15200, tags: ['games'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1, score: 93 },
  { id: 'writing', name: 'Creative Writers', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Fiction, poetry and critique', membersCount: 7300, tags: ['writing','art'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 32, score: 82 },
  { id: 'sailing', name: 'Sailors Club', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Boats, navigation and sea', membersCount: 4100, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 52, score: 74 },
  { id: 'crafts', name: 'DIY Crafts', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Handmade projects and ideas', membersCount: 6800, tags: ['art'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20, score: 80 },
  { id: 'philosophy', name: 'Philosophy Corner', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Deep discussions and ethics', membersCount: 5500, tags: ['general'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 44, score: 77 },
  { id: 'woodworking', name: 'Woodworking', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Furniture and carpentry', membersCount: 5200, tags: ['art'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, score: 78 },
  { id: 'meditation', name: 'Meditation Practice', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Mindfulness and techniques', membersCount: 8100, tags: ['health'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25, score: 83 },
  { id: 'digital-art', name: 'Digital Artists', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Illustration and concept art', membersCount: 9800, tags: ['art','design'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, score: 87 },
  { id: 'coffee', name: 'Coffee Lovers', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Brewing methods and beans', membersCount: 7600, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18, score: 81 },
  { id: 'standup', name: 'Stand-up Comedy', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Jokes, routines and shows', membersCount: 6400, tags: ['general'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 37, score: 79 },
  { id: 'watches', name: 'Watch Collectors', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Timepieces and horology', membersCount: 4700, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 43, score: 76 },
  { id: 'yoga', name: 'Yoga Community', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/b2765355923696e57724b37c25680821e2b92a3c?width=128', description: 'Poses, practice and wellness', membersCount: 8700, tags: ['health'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22, score: 84 },
  { id: 'wine', name: 'Wine Tasting', iconUrl: 'https://api.builder.io/api/v1/image/assets/TEMP/83ba69b9602689f247fffd1ebcfbed2d7df622d1?width=128', description: 'Vintages and sommeliers', membersCount: 5600, tags: ['lifestyle'], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 39, score: 78 },
];

import { createPortal } from 'react-dom';

export default function CommunityDiscoverModal({ isOpen, onClose, initialTab = 'volume', initialQuery = '', onJoin, items: customItems }: { isOpen: boolean; onClose: () => void; initialTab?: DiscoverTab; initialQuery?: string; onJoin?: (item: CommunityItem) => void; items?: CommunityItem[]; }) {
  const [tab, setTab] = useState<DiscoverTab>(initialTab);
  const [query, setQuery] = useState<string>(initialQuery);
  const [displayedCount, setDisplayedCount] = useState(24);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setQuery(initialQuery);
      setDisplayedCount(24);
    }
  }, [isOpen, initialTab, initialQuery]);

  useEffect(() => {
    setDisplayedCount(24);
  }, [tab, query]);

  const items = useMemo(() => {
    let list = [...(customItems || CATALOG)];
    
    // Sort by category
    if (tab === 'gainers') {
      // Sort by highest positive price change
      list.sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0));
    } else if (tab === 'losers') {
      // Sort by most negative price change
      list.sort((a, b) => (a.priceChange24h || 0) - (b.priceChange24h || 0));
    } else if (tab === 'volume') {
      // Sort by highest 24h volume
      list.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
    } else if (tab === 'new') {
      // Sort by most recently created
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i)=> i.name.toLowerCase().includes(q) || i.symbol?.toLowerCase().includes(q) || (i.tags||[]).some(t=>t.toLowerCase().includes(q)) || (i.description||'').toLowerCase().includes(q));
    }
    return list;
  }, [tab, query, customItems]);

  const visibleItems = useMemo(() => {
    return items.slice(0, displayedCount);
  }, [items, displayedCount]);

  // Handle scroll to load more items
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    
    if (bottom && !isLoadingMore && displayedCount < items.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + 12, items.length));
        setIsLoadingMore(false);
      }, 100);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-[6vh]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[1100px] max-w-[96vw] max-h-[90vh] rounded-3xl border border-[#181B22] custom-bg-blur overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#181B22] flex-shrink-0">
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-[#181B22] custom-bg-blur">
            {(['volume', 'gainers', 'losers', 'new'] as DiscoverTab[]).map((t) => (
              <button key={t} onClick={()=>setTab(t)} className={`h-8 px-3 rounded-full text-xs font-bold capitalize transition-colors ${tab===t? 'bg-gradient-to-r from-purple to-darkPurple text-white':'text-white hover:bg-white/5'}`}>
                {t === 'volume' && '💰 Volume'}
                {t === 'gainers' && '📈 Gainers'}
                {t === 'losers' && '📉 Losers'}
                {t === 'new' && '✨ New'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 h-10 px-4 rounded-full border border-[#181B22] custom-bg-blur w-[380px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#B0B0B0]"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/></svg>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search communities" className="flex-1 bg-transparent outline-none text-[15px] text-white placeholder:text-[#B0B0B0]" />
          </div>
          <button onClick={onClose} className="h-10 px-4 rounded-full border border-[#181B22] text-[#B0B0B0] text-sm font-bold hover:bg-white/5">Close</button>
        </div>

        <div className="p-5 grid grid-cols-3 gap-5 overflow-y-auto flex-1 min-h-0" onScroll={handleScroll}>
          {visibleItems.map((item)=> {
            const formatMembers = (count?: number) => {
              if (!count) return '0';
              if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
              if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
              return count.toString();
            };
            const formatPrice = (p?: number) => {
              if (!p) return '$0.00';
              if (p < 1) return `$${p.toFixed(4)}`;
              if (p < 100) return `$${p.toFixed(2)}`;
              return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            };
            const formatVolume = (v?: number) => {
              if (!v) return '$0';
              if (v >= 1000000000) return `$${(v / 1000000000).toFixed(2)}B`;
              if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
              return `$${v.toLocaleString()}`;
            };
            const isPositive = (item.priceChange24h ?? 0) >= 0;
            
            return (
              <div 
                key={item.id} 
                onClick={() => onJoin?.(item)} 
                title={item.description}
                className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-transparent bg-gradient-to-br from-white/5 to-transparent hover:border-purple/40 hover:bg-gradient-to-br hover:from-purple/15 hover:to-darkPurple/15 hover:scale-[1.02] transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-xl hover:shadow-purple/20 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full p-0.5 bg-gradient-to-br from-purple/60 to-darkPurple/60 flex-shrink-0 group-hover:from-purple/80 group-hover:to-darkPurple/80 transition">
                    <img src={item.iconUrl} alt={item.name} className="w-14 h-14 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-purple/40 transition" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-[16px] truncate">{item.name}</h3>
                      {item.symbol && <span className="text-[#B0B0B0] text-[13px] font-bold">{item.symbol}</span>}
                    </div>
                    {item.price !== undefined && (
                      <div 
                        className="text-[20px] font-extrabold mb-1 transition-colors duration-300"
                        style={{
                          color: isPositive ? '#6EE7B7' : '#EF4444',
                          textShadow: isPositive 
                            ? '0 0 10px rgba(110, 231, 183, 0.4)' 
                            : '0 0 10px rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        {formatPrice(item.price)}
                      </div>
                    )}
                    {item.priceChange24h !== undefined && (
                      <div 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm border transition-all duration-300"
                        style={{
                          borderColor: isPositive ? 'rgba(110, 231, 183, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                          backgroundColor: isPositive ? 'rgba(110, 231, 183, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isPositive ? '#6EE7B7' : '#EF4444',
                          boxShadow: isPositive 
                            ? '0 0 12px rgba(110, 231, 183, 0.3)' 
                            : '0 0 12px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        {isPositive ? '↑' : '↓'} {isPositive ? '+' : ''}{item.priceChange24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-[#B0B0B0] text-[13px] leading-relaxed line-clamp-2">{item.description}</p>
                
                {/* Members count */}
                {item.membersCount !== undefined && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <svg className="w-3.5 h-3.5 text-[#B0B0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-[#B0B0B0]">{formatMembers(item.membersCount)} members</span>
                  </div>
                )}
                
                {/* Show volume for crypto items if available */}
                {item.volume24h !== undefined && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#B0B0B0]">24h Vol:</span>
                    <span className="text-white font-bold">{formatVolume(item.volume24h)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                  {(item.tags && item.tags.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 text-[#B0B0B0] hover:border-purple/30 hover:text-purple transition">{t}</span>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onJoin?.(item);
                    }} 
                    className="ml-auto h-9 px-4 rounded-full bg-gradient-to-r from-purple to-darkPurple text-white text-sm font-bold shadow-lg shadow-purple/20 hover:shadow-purple/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    Open Chart
                  </button>
                </div>
              </div>
            );
          })}
          {visibleItems.length === 0 && (
            <div className="col-span-full text-center text-[#B0B0B0] py-12">No results. Try a different query.</div>
          )}
          {isLoadingMore && (
            <div className="col-span-full flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-purple-400">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium">Loading more...</span>
              </div>
            </div>
          )}
          {!isLoadingMore && displayedCount >= items.length && items.length > 0 && (
            <div className="col-span-full text-center text-[#B0B0B0]/50 py-4 text-xs">
              All {items.length} items loaded
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
