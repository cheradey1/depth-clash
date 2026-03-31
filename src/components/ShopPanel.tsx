import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Lock } from 'lucide-react';
import { GameTheme, SHIP_THEMES, ShipTheme, THEME_PRICING } from '../types';

// Ship image mappings
const SHIP_IMAGE_MAP: Record<ShipTheme, string> = {
  'classic': '/assets/ships/blue_1.png',
  'neon': '/assets/ships/blue_2.png',
  'stealth': '/assets/ships/blue_3.png',
  'elite': '/assets/ships/blue_4.png'
};

interface ShopPanelProps {
  currentTheme: GameTheme;
  onThemeChange: (theme: GameTheme) => void;
  onClose: () => void;
  currentPlayer?: 'Player1' | 'Player2';
  inventory?: {
    currency_balance: number;
    premium_ship_count: number;
  } | null;
  onBuyPremiumShip?: (cost?: number) => void;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({ currentTheme, onThemeChange, onClose, currentPlayer = 'Player1', inventory, onBuyPremiumShip }) => {
  const [theme, setTheme] = useState<GameTheme>(currentTheme);
  const [purchasedThemes, setPurchasedThemes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('depth-clash-purchased');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Load player-specific themes
  const [playerThemes, setPlayerThemes] = useState<Record<string, GameTheme>>(() => {
    const saved = localStorage.getItem('depth-clash-player-themes');
    return saved ? JSON.parse(saved) : { Player1: currentTheme, Player2: currentTheme };
  });

  // Add classic and default themes as always owned
  React.useEffect(() => {
    setPurchasedThemes(prev => {
      const updated = new Set(prev);
      updated.add('classic');
      updated.add('standard');
      updated.add('default');
      return updated;
    });
  }, []);

  // Persist player-specific themes
  React.useEffect(() => {
    localStorage.setItem('depth-clash-player-themes', JSON.stringify(playerThemes));
  }, [playerThemes]);

  const handleShipThemeChange = (shipTheme: ShipTheme) => {
    if (isPurchased(shipTheme)) {
      const newTheme = { ...theme, ships: shipTheme };
      setTheme(newTheme);
      // Save for current player
      setPlayerThemes(prev => ({ ...prev, [currentPlayer]: newTheme }));
      onThemeChange(newTheme);
    }
  };

  const handlePurchase = (themeName: string) => {
    const updated = new Set(purchasedThemes);
    updated.add(themeName);
    setPurchasedThemes(updated);
    localStorage.setItem('depth-clash-purchased', JSON.stringify(Array.from(updated)));
  };

  const isPurchased = (themeName: string): boolean => {
    return purchasedThemes.has(themeName);
  };

  const getThemeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      // Ships
      classic: '🚢 Standard submarine design',
      neon: '⚡ High-tech neon style',
      stealth: '🥷 Military stealth design',
      elite: '👑 Premium elite submarine',
    };
    return descriptions[type] || type;
  };

  const renderThemeButton = (themeName: string, category: 'ships', isSelected: boolean) => {
    const isFree = THEME_PRICING[themeName]?.type === 'free';
    const isPrem = !isFree;
    const isOwned = isPurchased(themeName);
    const pricing = THEME_PRICING[themeName];

    return (
      <motion.button
        key={themeName}
        whileHover={isOwned ? { scale: 1.05 } : {}}
        whileTap={isOwned ? { scale: 0.95 } : {}}
        onClick={() => {
          if (category === 'ships') {
            handleShipThemeChange(themeName as ShipTheme);
          }
        }}
        disabled={!isOwned}
        className={`p-4 rounded-lg transition-all border-2 relative overflow-hidden ${
          isSelected && isOwned
            ? 'bg-blue-600/40 border-blue-400 ring-2 ring-blue-400 shadow-lg shadow-blue-400/30'
            : isOwned
            ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
            : 'bg-slate-800/50 border-slate-700 opacity-70'
        } ${!isOwned ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Premium Locked Overlay */}
        {!isOwned && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Lock size={24} className="text-yellow-400" />
          </div>
        )}

        {/* Ship Image Preview */}
        {category === 'ships' && (
          <div className="mb-2 flex justify-center">
            <img
              src={SHIP_IMAGE_MAP[themeName as ShipTheme]}
              alt={themeName}
              className="w-16 h-16 object-contain drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white capitalize">{themeName}</span>
          {isSelected && isOwned && <Check size={20} className="text-blue-400" />}
        </div>
        <p className="text-sm text-slate-300 mb-2">{getThemeDescription(themeName)}</p>

        {/* Price/Free Badge */}
        <div className="flex items-center justify-between">
          {isFree ? (
            <span className="text-xs font-bold bg-green-500/30 text-green-300 px-2 py-1 rounded border border-green-500/50">
              FREE ✓
            </span>
          ) : (
            <span className={`text-xs font-bold px-2 py-1 rounded border ${
              isOwned
                ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                : 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50'
            }`}>
              {isOwned ? `OWNED ✓` : `$${pricing?.price || '0.00'}`}
            </span>
          )}
          {isPrem && !isOwned && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase(themeName);
              }}
              className="text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-1 rounded transition"
            >
              BUY
            </motion.button>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500/30 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart size={32} className="text-yellow-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            SHOP
          </h2>
        </div>
        {inventory && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-600 text-sm text-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Currency: <strong>{inventory.currency_balance}</strong></span>
              <span>Premium Ships: <strong>{inventory.premium_ship_count}</strong></span>
            </div>
          </div>
        )}

        {/* Ships Theme */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-yellow-300 mb-4">🚢 SHIP SKINS</h3>
          <div className="grid grid-cols-4 gap-3">
            {SHIP_THEMES.map((shipTheme) =>
              renderThemeButton(shipTheme, 'ships', theme.ships === shipTheme)
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-8 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-300 mb-2">Current Setup:</p>
          <p className="text-lg font-semibold text-white">
            🚢 {theme.ships}
          </p>
        </div>

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg transition shadow-lg"
        >
          ✅ Close Shop
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
