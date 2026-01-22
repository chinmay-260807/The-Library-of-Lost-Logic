
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Quote, Feather, Share2, Sparkles, ThumbsUp, ThumbsDown, Image as ImageIcon, Loader2, Palette, Type, Landmark, ExternalLink, Wand2, Info, Link as LinkIcon, Send } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface StoryDisplayProps {
  story: string;
  isLoading: boolean;
  rating: 'up' | 'down' | null;
  onRate: (rating: 'up' | 'down' | null) => void;
}

type TextStyle = 'classic' | 'modern' | 'antique' | 'minimal';
type SurrealStyle = 'Dreamscape' | 'Abstract Surrealism' | 'Biomechanical Surrealism' | 'Pop Surrealism' | 'Gothic Surrealism' | 'Classic Surrealism';

const SURREALIST_ARTISTS = [
  'Salvador Dalí', 'René Magritte', 'Max Ernst', 'Leonora Carrington', 
  'Joan Miró', 'Yves Tanguy', 'Remedios Varo', 'Giorgio de Chirico',
  'Kay Sage', 'Dorothea Tanning', 'Man Ray', 'Frida Kahlo', 'Leonor Fini'
];

const SURREAL_STYLES: SurrealStyle[] = [
  'Dreamscape', 
  'Abstract Surrealism', 
  'Biomechanical Surrealism', 
  'Pop Surrealism', 
  'Gothic Surrealism',
  'Classic Surrealism'
];

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, rating, onRate }) => {
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied' | 'failed'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeArtist, setActiveArtist] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [textStyle, setTextStyle] = useState<TextStyle>('classic');
  const [selectedSurrealStyle, setSelectedSurrealStyle] = useState<SurrealStyle>('Dreamscape');
  
  // Easter egg states
  const [illustrateClicks, setIllustrateClicks] = useState(0);
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);

  // Clear states when a new story is loaded
  useEffect(() => {
    setImageUrl(null);
    setActiveArtist(null);
    setIllustrateClicks(0);
    setShareStatus('idle');
    setCopied(false);
  }, [story]);

  const handleCopy = () => {
    navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIllustrate = async () => {
    // Increment Easter egg counter
    const newCount = illustrateClicks + 1;
    setIllustrateClicks(newCount);
    
    if (newCount === 5) {
      setIsEasterEggActive(true);
      setTimeout(() => setIsEasterEggActive(false), 6000);
      setIllustrateClicks(0); // Reset after trigger
    }

    if (isImageLoading || !!imageUrl || !story) return;
    setIsImageLoading(true);
    
    const randomArtist = SURREALIST_ARTISTS[Math.floor(Math.random() * SURREALIST_ARTISTS.length)];
    
    try {
      const url = await generateImage(story, randomArtist, selectedSurrealStyle);
      setImageUrl(url);
      setActiveArtist(randomArtist);
    } catch (err) {
      console.error(err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `"${story}"\n\n— A fragment from The Library of Lost Logic.`;
    const shareUrl = window.location.origin + window.location.pathname;
    const shareData = {
      title: 'The Library of Lost Logic',
      text: shareText,
      url: shareUrl,
    };

    // Attempt to use native sharing if supported
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
      // Manual fallback: Clipboard copy with prominent messaging
      copyFallback(shareText, shareUrl);
    }
  };

  const copyFallback = (text: string, url: string) => {
    const fullCopyText = `${text}\n\nExplore the Library: ${url}`;
    navigator.clipboard.writeText(fullCopyText).then(() => {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 7000); // Prominent duration
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

  const cycleSurrealStyle = () => {
    const currentIndex = SURREAL_STYLES.indexOf(selectedSurrealStyle);
    const nextIndex = (currentIndex + 1) % SURREAL_STYLES.length;
    setSelectedSurrealStyle(SURREAL_STYLES[nextIndex]);
    setImageUrl(null);
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

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {isEasterEggActive && (
          <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 100, opacity: 0, rotate: 0, scale: 0.5 }}
                animate={{ y: -200, opacity: [0, 0.8, 0], rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: [0.5, 1.2, 0.8] }}
                transition={{ duration: 4 + Math.random() * 4, delay: i * 0.15, ease: "easeOut" }}
                className="absolute text-[#b2935b]/30"
              >
                {i % 3 === 0 ? <Sparkles size={24 + Math.random() * 20} /> : i % 3 === 1 ? <Feather size={20 + Math.random() * 15} /> : <Landmark size={18 + Math.random() * 10} />}
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#b2935b]/5 backdrop-blur-[1px]" />
          </div>
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
            
            <AnimatePresence>
              {imageUrl && (
                <motion.div initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} className="mb-12 flex flex-col items-center">
                  <div className="relative group">
                    <div className="absolute -inset-4 border border-black/[0.03] rounded shadow-sm pointer-events-none"></div>
                    <img src={imageUrl} alt="Story illustration" className="w-64 h-64 md:w-80 md:h-80 object-cover rounded shadow-2xl sepia-[0.2] transition-all hover:sepia-0" />
                  </div>
                  {activeArtist && (
                    <div className="mt-6 flex flex-col items-center gap-1">
                      <p className="font-serif italic text-[11px] md:text-xs tracking-wider text-black text-center opacity-40">In the style of {activeArtist}</p>
                      <p className="font-sans font-bold uppercase text-[8px] tracking-[0.3em] text-black opacity-25">{selectedSurrealStyle}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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
                  <div className="flex items-center gap-1 group/style">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={cycleSurrealStyle} className="btn-plaque p-3 rounded-full text-black/30 hover:text-black" title="Style"><Wand2 size={16} /></motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleIllustrate} className={`btn-plaque p-3 rounded-full transition-all ${imageUrl ? 'text-[#b2935b] border-[#b2935b]' : 'text-black/30 hover:text-black'} ${isImageLoading ? 'cursor-wait' : ''}`} title="Visualize">
                      {isImageLoading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    </motion.button>
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopy} className="btn-plaque p-3 rounded-full text-black/30 hover:text-black" title="Archive">{copied ? <Check size={16} className="text-green-700" /> : <Copy size={16} />}</motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className={`btn-plaque p-3 rounded-full transition-all ${shareStatus !== 'idle' ? 'text-[#b2935b] border-[#b2935b]' : 'text-black/30 hover:text-black'}`} title="Expose">
                    {shareStatus === 'idle' ? <Share2 size={16} /> : <Check size={16} className={shareStatus === 'failed' ? 'text-red-400' : 'text-green-700'} />}
                  </motion.button>
                </div>
              </div>
              <AnimatePresence>
                {(isImageLoading || isEasterEggActive || shareStatus !== 'idle' || !!selectedSurrealStyle) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center gap-1 mt-2">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-[#b2935b] font-medium">
                      {isEasterEggActive ? "Reality Constraint Breached..." : isImageLoading ? "Painting a Dream in Vibrant Hues..." : shareStatus === 'copied' ? "Dissemination Channel: Clipboard Manual" : shareStatus === 'shared' ? "Fragment Disseminated Successfully" : !imageUrl ? `Mode: ${selectedSurrealStyle}` : ""}
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
