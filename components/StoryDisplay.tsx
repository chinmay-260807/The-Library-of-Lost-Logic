
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Quote, Feather, Share2, ThumbsUp, ThumbsDown, Type, Check as CheckIcon, Send } from 'lucide-react';

interface StoryDisplayProps {
  story: string;
  isLoading: boolean;
  rating: 'up' | 'down' | null;
  onRate: (rating: 'up' | 'down' | null) => void;
}

type TextStyle = 'classic' | 'modern' | 'antique' | 'minimal';

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, rating, onRate }) => {
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');
  const [textStyle, setTextStyle] = useState<TextStyle>('classic');
  
  // Clear states when a new story is loaded
  useEffect(() => {
    setShareStatus('idle');
    setCopied(false);
  }, [story]);

  const handleCopy = () => {
    navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `"${story}"\n\n— A fragment from The Library of Lost Logic.`;
    const shareUrl = window.location.origin + window.location.pathname;
    const shareData = {
      title: 'The Library of Lost Logic',
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share && typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 3000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Native share failed, falling back to clipboard:', err);
          copyFallback(shareText, shareUrl);
        }
      }
    } else {
      copyFallback(shareText, shareUrl);
    }
  };

  const copyFallback = (text: string, url: string) => {
    const fullCopyText = `${text}\n\nExplore the Library: ${url}`;
    navigator.clipboard.writeText(fullCopyText).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 7000); 
    }).catch(err => {
      console.error('Clipboard fallback failed:', err);
      setShareStatus('failed');
      setTimeout(() => setShareStatus('idle'), 3000);
    });
  };

  const cycleTextStyle = () => {
    const styles: TextStyle[] = ['classic', 'modern', 'antique', 'minimal'];
    const currentIndex = styles.indexOf(textStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setTextStyle(styles[nextIndex]);
  };

  const getStyleClasses = () => {
    switch (textStyle) {
      case 'modern': return 'font-sans font-semibold tracking-tight uppercase text-black/80 text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
      case 'antique': return 'font-serif font-bold text-black/95 text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
      case 'minimal': return 'font-sans font-light tracking-widest text-black/70 text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
      case 'classic': default: return 'font-serif italic text-black/90 text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 md:p-12 relative">
      
      {/* High-Prominence Manual Share Notification */}
      <AnimatePresence>
        {shareStatus === 'copied' && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[300] bg-white border border-[#b2935b]/50 shadow-[0_40px_80px_rgba(0,0,0,0.2)] px-10 py-8 rounded-[2rem] flex flex-col items-center gap-6 max-w-[90vw] md:max-w-lg text-center backdrop-blur-xl"
          >
            <div className="bg-[#b2935b] p-5 rounded-full shadow-[0_10px_30px_rgba(178,147,91,0.4)]">
              <Send size={28} className="text-white" />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[12px] uppercase tracking-[0.4em] font-black text-[#b2935b]">Manual Dissemination Protocol</h3>
              <p className="text-[15px] text-black/70 font-serif italic leading-relaxed">
                Fragment & link successfully secured to clipboard.
              </p>
              <div className="h-[1px] w-12 bg-black/5 mx-auto my-1"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold">
                You may now paste and disseminate this truth across your preferred channels.
              </p>
            </div>
            <button 
              onClick={() => setShareStatus('idle')}
              className="mt-2 text-[9px] uppercase tracking-widest font-black text-black/20 hover:text-black transition-colors"
            >
              [ Acknowledge Dispatch ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-20">
            <div className="relative">
              <div className="w-14 h-14 md:w-16 md:h-16 border border-black/[0.03] rounded-full flex items-center justify-center">
                <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                  <Feather size={22} className="text-[#b2935b]" />
                </motion.div>
              </div>
            </div>
            <p className="text-[9px] tracking-[0.6em] uppercase font-medium text-black/30">Curating the Impossible</p>
          </motion.div>
        ) : (
          <motion.div key={story} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="max-w-5xl w-full flex flex-col items-center">
            
            <div className="mb-6 md:mb-10 opacity-[0.05] scale-125 md:scale-150"><Quote size={40} /></div>

            <motion.div className="relative group mb-12 md:mb-16 px-4 md:px-10" whileHover={{ scale: 1.002 }} transition={{ duration: 0.6 }}>
              <div className="absolute -inset-x-4 -inset-y-4 md:-inset-x-12 md:-inset-y-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden sm:block">
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#b2935b]/30"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#b2935b]/30"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#b2935b]/30"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#b2935b]/30"></div>
              </div>
              <h2 className={`text-center leading-[1.3] animate-ink ${getStyleClasses()}`}>{story}</h2>
            </motion.div>

            <div className="flex flex-col items-center gap-10 w-full">
              <div className="h-[1px] w-8 md:w-12 bg-[#b2935b]/20"></div>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => onRate(rating === 'up' ? null : 'up')} className={`group flex flex-col items-center gap-3 transition-all relative ${rating === 'up' ? 'text-[#b2935b]' : 'text-black/25 hover:text-black/60'}`}>
                  <ThumbsUp size={18} strokeWidth={rating === 'up' ? 2.5 : 1.5} />
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-semibold">Profound</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.9 }} onClick={() => onRate(rating === 'down' ? null : 'down')} className={`group flex flex-col items-center gap-3 transition-all relative ${rating === 'down' ? 'text-black' : 'text-black/25 hover:text-black/60'}`}>
                  <ThumbsDown size={18} strokeWidth={rating === 'down' ? 2.5 : 1.5} />
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-semibold">Absurd</span>
                </motion.button>

                <div className="h-6 w-[1px] bg-black/5 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={cycleTextStyle} className="btn-plaque p-3 rounded-full text-black/30 hover:text-black" title="Typography"><Type size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopy} className="btn-plaque p-3 rounded-full text-black/30 hover:text-black" title="Archive">{copied ? <CheckIcon size={16} className="text-green-700" /> : <Copy size={16} />}</motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className={`btn-plaque p-3 rounded-full transition-all ${shareStatus !== 'idle' ? 'text-[#b2935b] border-[#b2935b]' : 'text-black/30 hover:text-black'}`} title="Expose">
                    {shareStatus === 'idle' ? <Share2 size={16} /> : <CheckIcon size={16} className={shareStatus === 'failed' ? 'text-red-400' : 'text-green-700'} />}
                  </motion.button>
                </div>
              </div>
              <AnimatePresence>
                {shareStatus !== 'idle' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center gap-1 mt-2">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-[#b2935b] font-medium">
                      {shareStatus === 'copied' ? "Dissemination Channel: Clipboard Manual" : shareStatus === 'shared' ? "Fragment Disseminated Successfully" : ""}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryDisplay;
