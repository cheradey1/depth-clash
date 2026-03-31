import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Copy, Check, Share2, Clock, Facebook, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnlineGameLobbyProps {
  connectionState: 'connected' | 'connecting' | 'disconnected';
  roomId?: string;
  isHost?: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  onSetNickname: (nickname: string) => void;
  onBack: () => void;
}

export const OnlineGameLobby: React.FC<OnlineGameLobbyProps> = ({
  connectionState,
  roomId,
  isHost,
  onCreateRoom,
  onJoinRoom,
  onSetNickname,
  onBack
}) => {
  const [nickname, setNickname] = useState('Player');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    setNickname(newNickname);
    onSetNickname(newNickname);
    console.log('[NICKNAME] Changed:', newNickname);
  };

  const handleCreateRoom = () => {
    if (nickname.trim()) {
      onCreateRoom();
      setIsWaitingForOpponent(true);
      setCountdown(30);
    } else {
      alert('Введіть нікнейм!');
    }
  };

  const handleJoinRoom = () => {
    console.log('[JOIN] Code entered:', joinCode, 'Current state:', { joinCode, connectionState });
    if (joinCode.trim()) {
      onSetNickname(nickname);
      onJoinRoom(joinCode.toUpperCase());
      setShowJoinForm(false);
      setJoinCode('');
    } else {
      alert('Введіть код кімнати!');
    }
  };

  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitingForOpponent && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsWaitingForOpponent(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWaitingForOpponent, countdown]);

  const generateShareableLink = () => {
    if (!roomId) return '';
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#join=${roomId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToSocial = (platform: string) => {
    const link = generateShareableLink();
    const text = `Join my Depth Clash battle! Room: ${roomId}`;
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(link);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedLink}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-72 sm:w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-l-3xl p-2 sm:p-3 shadow-2xl border-l-2 border-amber-500/30 z-50 flex flex-col max-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 rounded-l-3xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><defs><pattern id=%22grid%22 width=%2220%22 height=%2220%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 20 0 L 0 0 0 20%22 fill=%22none%22 stroke=%22white%22 stroke-width=%220.5%22/></pattern></defs><rect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22/></svg>')]" />
      </div>

      {/* Connection status */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 z-10">
        {connectionState === 'connected' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1"
          >
            <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-xs text-green-400 hidden sm:inline">Online</span>
          </motion.div>
        )}
        {connectionState === 'connecting' && (
          <div className="flex items-center gap-1">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </motion.div>
            <span className="text-xs text-yellow-400 hidden sm:inline">Connecting</span>
          </div>
        )}
        {connectionState === 'disconnected' && (
          <div className="flex items-center gap-1">
            <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            <span className="text-xs text-red-400 hidden sm:inline">Offline</span>
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors z-10"
        title="Back to main menu"
      >
        ←
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto mt-10 sm:mt-12 pb-2 custom-scrollbar">
        {/* Title */}
        <div className="mb-2">
          <h2 className="text-lg sm:text-xl font-bold text-center mb-1 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            Online Battle
          </h2>
          <p className="text-center text-slate-400 text-xs">Гра онлайн</p>
        </div>

        {/* Nickname input */}
        <div className="mb-2">
          <label className="block text-amber-300 text-xs font-semibold mb-1">Нікнейм:</label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="Введіть нік"
            autoFocus
            maxLength={20}
            className="w-full px-2 py-1 bg-slate-700 border-2 border-amber-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition text-xs"
          />
        </div>

        {/* Room created state */}
        {roomId && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mb-2 p-2 sm:p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-2 border-green-500/50 rounded-lg"
          >
            <p className="text-green-300 text-xs mb-1 font-semibold">
              ✅ {isHost ? 'Кімната створена!' : 'Успішно приєднано!'}
            </p>

            {/* Countdown timer */}
            {isWaitingForOpponent && (
              <div className="mb-2 p-1 bg-slate-800/50 rounded border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-300 text-xs font-semibold">Чекаємо суперника</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-white">{countdown}</span>
                  <span className="text-slate-400 text-xs ml-1">сек</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-green-500/30 mb-2">
              <code className="text-white font-mono text-xs flex-1 truncate">{roomId}</code>
              <button
                onClick={copyRoomCode}
                className="p-1 hover:bg-slate-700 rounded transition flex-shrink-0"
                title="Copy room code"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-amber-400" />
                )}
              </button>
            </div>

            {/* Shareable link */}
            <div className="mb-2">
              <p className="text-slate-300 text-xs mb-1">Посилання:</p>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-blue-500/30">
                <code className="text-blue-300 font-mono text-xs flex-1 truncate">{generateShareableLink()}</code>
                <button
                  onClick={copyShareableLink}
                  className="p-1 hover:bg-slate-700 rounded transition flex-shrink-0"
                  title="Copy shareable link"
                >
                  <Share2 className="w-3 h-3 text-blue-400" />
                </button>
              </div>
            </div>

            {/* Social sharing buttons */}
            <div>
              <p className="text-slate-300 text-xs mb-1">Поділитися:</p>
              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareToSocial('facebook')}
                  className="flex-1 p-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs font-semibold transition"
                >
                  FB
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareToSocial('telegram')}
                  className="flex-1 p-1 bg-blue-500 hover:bg-blue-400 rounded text-white text-xs font-semibold transition"
                >
                  TG
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => shareToSocial('whatsapp')}
                  className="flex-1 p-1 bg-green-600 hover:bg-green-500 rounded text-white text-xs font-semibold transition"
                >
                  WA
                </motion.button>
              </div>
            </div>

            <p className="text-slate-400 text-xs mt-1">
              Поділіться кодом з друзями!
            </p>
          </motion.div>
        )}

        {/* Action buttons */}
        {!roomId ? (
          <div className="space-y-1 mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoom}
              disabled={connectionState !== 'connected'}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg text-xs"
            >
              🎮 Створити
            </motion.button>

            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="w-full py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition text-xs"
            >
              {showJoinForm ? 'Скасувати' : 'Приєднатися'}
            </button>
          </div>
        ) : null}

        {/* Join form */}
        {showJoinForm && !roomId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 space-y-1"
          >
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                const code = e.target.value.toUpperCase();
                setJoinCode(code);
                console.log('[JOIN_INPUT] User typed:', code, 'Length:', code.length);
              }}
              placeholder="Код"
              maxLength={6}
              autoFocus
              className="w-full px-2 py-1 bg-slate-700 border-2 border-amber-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition uppercase text-xs"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinRoom}
              disabled={connectionState !== 'connected' || !joinCode.trim()}
              className="w-full py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-lg text-xs"
            >
              Приєднатися
            </motion.button>
          </motion.div>
        )}

        {/* Status messages */}
        {connectionState === 'connecting' && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center text-yellow-400 text-xs mb-2"
          >
            Підключення...
          </motion.p>
        )}

        {connectionState === 'disconnected' && (
          <p className="text-center text-red-400 text-xs mb-2">
            ⚠️ Немає зв'язку
          </p>
        )}

        {/* Back button at bottom */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-full py-1 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold rounded-lg transition border border-slate-600 text-xs"
        >
          ← Меню
        </motion.button>
      </div>
    </div>
  );
};
