
import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { History, Book, RotateCcw, Trash2, Menu, X, Landmark, Fingerprint, Map, ThumbsUp, ThumbsDown, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import StoryDisplay from './components/StoryDisplay';
import StoryForm from './components/StoryForm';
import { Story } from './types';
import { FALLBACK_STORIES } from './constants';
import { generateStory } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'gallery-impossible-vault-v2';
const LOCAL_STORAGE_RATINGS_KEY = 'gallery-impossible-ratings-v2';

// --- Error Boundary Component ---
// Added optional children to fix "missing children" error and used explicit state definition for TypeScript compatibility.
interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly define state property to resolve TypeScript "property does not exist" errors.
  public state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }
  
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fdfcf9] p-10 text-center">
          <AlertTriangle size={48} className="text-red-800/20 mb-6" />
          <h1 className="font-serif italic text-3xl mb-4 text-black/80">Catastrophic Logic Failure</h1>
          <p className="max-w-md text-sm text-black/40 uppercase tracking-widest leading-relaxed mb-8">
            The archives have suffered a structural collapse. This reality is currently being reconstructed.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-full hover:bg-[#b2935b] transition-all"
          >
            Re-Initialize Archive <RefreshCw size={14} />
          </button>
        </div>
      );
    }
    // Accessing this.props.children is safe as it is part of React.Component
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    const savedVault = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedVault) {
      try { setUserStories(JSON.parse(savedVault)); } catch (e) { console.error(e); }
    }
    const savedRatings = localStorage.getItem(LOCAL_STORAGE_RATINGS_KEY);
    if (savedRatings) {
      try { setRatings(JSON.parse(savedRatings)); } catch (e) { console.error(e); }
    }
    handleGenerateStory();
  }, []);

  const saveUserStories = (stories: Story[]) => {
    setUserStories(stories);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stories));
  };

  const handleRate = (rating: 'up' | 'down' | null) => {
    if (!currentStory) return;
    const newRatings = { ...ratings };
    if (rating === null) delete newRatings[currentStory];
    else newRatings[currentStory] = rating;
    setRatings(newRatings);
    localStorage.setItem(LOCAL_STORAGE_RATINGS_KEY, JSON.stringify(newRatings));
  };

  const handleAddUserStory = (text: string) => {
    const newStory: Story = {
      id: Math.random().toString(36).substring(7),
      text,
      timestamp: Date.now(),
      isUserSubmitted: true
    };
    saveUserStories([newStory, ...userStories]);
  };

  const handleExport = () => {
    if (userStories.length === 0) return;
    const dataStr = JSON.stringify(userStories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `library-fragments-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateStory = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const shouldPickUserStory = userStories.length > 0 && Math.random() < 0.2;
      let nextStory = '';

      if (shouldPickUserStory) {
        const randomIndex = Math.floor(Math.random() * userStories.length);
        nextStory = userStories[randomIndex].text;
      } else {
        try {
          nextStory = await generateStory();
        } catch (error) {
          console.warn("API Failure, using local archive:", error);
          const randomIndex = Math.floor(Math.random() * FALLBACK_STORIES.length);
          nextStory = FALLBACK_STORIES[randomIndex];
        }
      }

      if (nextStory === currentStory && (userStories.length + FALLBACK_STORIES.length > 1)) {
        handleGenerateStory();
        return;
      }

      setCurrentStory(nextStory);
      setHistory(prev => [nextStory, ...prev].slice(0, 50));
    } catch (err) {
      setError("The logic engine failed to initialize.");
    } finally {
      setIsLoading(false);
    }
  }, [userStories, currentStory]);

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-[#fdfcf9]">
        
        {/* Gallery Header */}
        <header className="flex-none p-6 md:p-10 flex justify-between items-center z-40 bg-[#fdfcf9]/80 backdrop-blur-md border-b border-black/[0.02]">
          <div className="flex items-center gap-4 md:gap-6 group">
            <div className="w-10 h-10 border border-black/5 rounded-full flex items-center justify-center group-hover:border-[#b2935b] transition-colors bg-white shadow-sm">
              <Landmark size={16} className="text-black/80 group-hover:text-[#b2935b] transition-all" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[11px] md:text-[13px] font-semibold uppercase tracking-[0.6em] text-black/90">The Library</h1>
              <span className="text-[8px] uppercase tracking-[0.4em] text-black/30 font-medium">Volume IX : Lost Logic</span>
            </div>
          </div>

          <button 
            onClick={() => setIsArchiveOpen(true)}
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-semibold text-black/40 hover:text-black transition-all bg-white/50 px-4 md:px-5 py-2.5 rounded-full border border-black/[0.03] backdrop-blur-sm"
          >
            <span className="hidden sm:inline">Curator Drawer</span> <Menu size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Unified Scrollable Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-20 flex flex-col items-center scroll-smooth">
          {error ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center p-10">
              <AlertTriangle size={32} className="text-black/10 mb-4" />
              <p className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-8">{error}</p>
              <button 
                onClick={handleGenerateStory}
                className="btn-plaque px-10 py-4 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold"
              >
                Restore Logic
              </button>
            </div>
          ) : (
            <>
              <div className="w-full flex-none min-h-[60vh] flex flex-col items-center justify-center pt-8 md:pt-12">
                <StoryDisplay 
                  story={currentStory} 
                  isLoading={isLoading} 
                  rating={ratings[currentStory] || null}
                  onRate={handleRate}
                />
              </div>
              
              <div className="w-full flex-none py-16 md:py-24 flex flex-col items-center justify-center">
                 <button
                  onClick={handleGenerateStory}
                  disabled={isLoading}
                  className="group flex flex-col items-center gap-4 transition-all outline-none"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-black/[0.04] flex items-center justify-center group-hover:border-[#b2935b] group-hover:bg-white transition-all shadow-sm group-active:scale-95">
                    <RotateCcw 
                      size={22} 
                      className={`text-black/30 group-hover:text-[#b2935b] transition-all ${isLoading ? 'animate-spin text-[#b2935b]' : 'group-hover:rotate-180 duration-1000'}`} 
                    />
                  </div>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.7em] font-bold text-black/20 group-hover:text-black/60 transition-all">Next Fragment</span>
                </button>
              </div>
            </>
          )}

          <footer className="w-full flex-none px-10 py-10 flex justify-between items-center opacity-40 border-t border-black/[0.02] mt-auto">
            <div className="flex items-center gap-6 text-[8px] font-bold uppercase tracking-[0.5em]">
              <span className="flex items-center gap-2"><Map size={10} /> Sector A</span>
              <span className="hidden sm:inline">Archive Room 303</span>
            </div>
            
            <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.5em]">
              <Fingerprint size={12} /> Authentic Fragment
            </div>
          </footer>
        </main>

        {/* The Curator's Drawer */}
        <div 
          className={`fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[100] transition-opacity duration-700 ${isArchiveOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsArchiveOpen(false)}
        >
          <div 
            className={`absolute right-0 top-0 h-full w-full max-w-lg bg-[#fdfcf9] shadow-[-20px_0_60px_rgba(0,0,0,0.05)] transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) p-10 md:p-16 flex flex-col ${isArchiveOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-none flex justify-between items-center mb-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.5em]">The Archive</h2>
                <span className="text-[9px] uppercase tracking-[0.3em] text-black/30 italic">Curator's Private Log</span>
              </div>
              <button onClick={() => setIsArchiveOpen(false)} className="text-black/20 hover:text-black transition-colors p-3 hover:bg-black/5 rounded-full">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-none mb-10 pb-8 border-b border-black/[0.05]">
              <StoryForm onAddStory={handleAddUserStory} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2 custom-scroll relative">
              <div className="sticky top-0 bg-[#fdfcf9]/95 backdrop-blur-md z-10 pt-2 pb-6 text-[9px] font-bold uppercase tracking-[0.4em] text-black/20 flex items-center gap-3 shadow-[0_15px_15px_-15px_rgba(253,252,249,1)]">
                <History size={12} /> Log History
              </div>
              
              <div className="space-y-12 pb-10 mt-6">
                {history.map((h, i) => (
                  <div key={i} className="group flex flex-col gap-4 opacity-40 hover:opacity-100 transition-all duration-500">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-[#b2935b] font-bold tracking-widest uppercase">Fragment_{history.length - i}</span>
                      {ratings[h] && (
                        <div className="flex items-center gap-2">
                          {ratings[h] === 'up' ? (
                            <ThumbsUp size={12} className="text-[#b2935b]" />
                          ) : (
                            <ThumbsDown size={12} className="text-black/40" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="font-serif text-xl md:text-2xl leading-[1.4] italic text-black/85 transition-transform group-hover:translate-x-1">
                      "{h}"
                    </p>
                    <div className="h-[1px] w-full bg-black/[0.03]"></div>
                  </div>
                ))}
              </div>

              {history.length === 0 && (
                <div className="h-48 flex flex-col items-center justify-center opacity-[0.05] gap-6">
                  <Book size={64} strokeWidth={1} />
                  <span className="text-[11px] uppercase tracking-[0.5em] font-bold">The ledger is empty</span>
                </div>
              )}
            </div>

            {userStories.length > 0 && (
              <div className="flex-none mt-8 pt-8 border-t border-black/[0.05] flex justify-between items-end">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-black/30 font-bold">Vault Integrity</span>
                  <span className="text-xs font-serif italic text-black/60">{userStories.length} Submissions</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleExport} className="text-[9px] uppercase tracking-widest font-bold text-black/40 hover:text-[#b2935b] flex items-center gap-2 transition-colors group px-3 py-1.5 hover:bg-[#b2935b]/5 rounded-lg">
                    <Download size={13} /> Export
                  </button>
                  <button onClick={() => confirm("Purge user records?") && saveUserStories([])} className="text-[9px] uppercase tracking-widest font-bold text-red-900/30 hover:text-red-600 flex items-center gap-2 transition-colors group px-3 py-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 size={13} /> Purge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
