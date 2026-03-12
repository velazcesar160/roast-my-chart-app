// Sovereign Pro Sniper Pack - Version 1.1.1 (Force-Redeploy Trigger)
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, TrendingDown, Terminal, Twitter, Copy, Zap, Download } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState('');
  const [error, setError] = useState('');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('"{roast}"\n\nAudit your trades here: https://roast-my-chart-app.vercel.app #Trading #SovereignPro');
  const fileInputRef = useRef(null);

  const copyWithImage = async (text) => {
    try {
      const resp = await fetch(image);
      const blob = await resp.blob();
      const data = [new ClipboardItem({ 
        "text/plain": new Blob([text], { type: "text/plain" }),
        [blob.type]: blob 
      })];
      await navigator.clipboard.write(data);
      alert('Roast & Chart copied! You can now Ctrl+V in Twitter.');
    } catch (err) {
      navigator.clipboard.writeText(text);
      alert('Roast copied! (Image copy failed - browser restriction)');
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `RoastedChart_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    // Reset state
    setError('');
    setRoast('');
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG/JPG/WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64String = e.target.result;
      setImage(base64String);
      await getRoast(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const getRoast = async (dataUrl, mimeType) => {
    setLoading(true);
    // Extract just the base64 part, discarding the "data:image/jpeg;base64," prefix
    const base64Data = dataUrl.split(',')[1];

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to roast chart.');
      }

      setRoast(data.roast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add global event listener for image pasting (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e) => {
      // Don't intercept paste if they are typing in an input field (we don't have any here, but good practice)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) processFile(file);
          break; // Only process the first image found in clipboard
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-mono selection:bg-[#00ff88] selection:text-black">
      
      {/* Header */}
      <header className="max-w-4xl mx-auto py-8 text-center">
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <Terminal className="w-8 h-8 text-[#00ff88]" />
          <h1 className="text-4xl font-black tracking-tighter uppercase">Auditor<span className="text-[#00ff88]">Pro</span></h1>
        </div>
        <p className="text-gray-400 text-lg">The AI Chart Auditor. Upload a screenshot to get ruthlessly roasted.</p>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto space-y-8">
        
        {/* Upload Zone */}
        {!image && !loading && (
          <div 
            className="glass-panel neon-border rounded-xl p-12 text-center cursor-pointer hover:bg-white/5 transition-all outline-dashed outline-2 outline-offset-4 outline-[#00ff88]/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-[#00ff88]/10 rounded-full">
                <UploadCloud className="w-12 h-12 text-[#00ff88]" />
              </div>
              <div>
                <p className="text-xl font-bold mb-2">Drag & drop your chart here</p>
                <p className="text-sm text-gray-500 mb-2">or click to browse your files</p>
                <p className="text-xs text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full inline-block font-bold">Try pressing Ctrl+V to paste an image directly!</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center space-x-3">
            <TrendingDown className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Display Image & Roast */}
        {(image || loading) && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Image Preview */}
            <div className="glass-panel neo-border rounded-xl overflow-hidden shadow-2xl relative">
               <img src={image} alt="Uploaded chart" className={`w-full h-auto object-cover max-h-[500px] ${loading ? 'opacity-50 grayscale' : 'opacity-100'}`} />
               {loading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-10 h-10 text-[#00ff88] animate-spin" />
                      <p className="text-[#00ff88] font-bold tracking-widest animate-pulse uppercase text-sm">Analyzing Support/Resistance failures...</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Roast Result */}
            {roast && !loading && (
              <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative group p-1 bg-gradient-to-r from-indigo-500/50 via-[#00ff88]/50 to-indigo-500/50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="bg-[#0a0a0a] rounded-[30px] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#00ff88]/10 p-2 rounded-lg">
                          <Zap className="w-5 h-5 text-[#00ff88]" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-[#00ff88]">Auditor Pro Roast</span>
                      </div>
                      
                      <div className="text-xl md:text-2xl font-bold leading-relaxed text-zinc-100 italic">
                        <Typewriter text={roast} speed={30} />
                      </div>

                      <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                        <button 
                          onClick={() => {
                            const shareText = selectedTemplate.replace('{roast}', roast);
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                          }}
                          className="flex items-center gap-2 bg-[#1DA1F2] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#1a91da] transition-all transform hover:scale-105"
                        >
                          <Twitter className="w-4 h-4" /> Share to X
                        </button>
                        
                        <button 
                          onClick={() => copyWithImage(selectedTemplate.replace('{roast}', roast))}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 text-zinc-300 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          <Copy className="w-4 h-4" /> Copy Sniper Pack
                        </button>

                        <button 
                          onClick={downloadImage}
                          className="flex items-center gap-2 bg-white/5 border border-[#00ff88]/30 text-[#00ff88] px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#00ff88]/5 hover:border-[#00ff88] transition-all"
                        >
                          <Download className="w-4 h-4" /> Save Chart
                        </button>

                        <div className="flex-grow"></div>

                        <select 
                          onChange={(e) => {
                            if (!e.target.value) return;
                            setSelectedTemplate(e.target.value);
                          }}
                          className="bg-zinc-900 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-black uppercase px-4 py-2.5 rounded-full outline-none focus:border-[#00ff88] cursor-pointer"
                        >
                          <option value='"{roast}"\n\nAudit your trades here: https://roast-my-chart-app.vercel.app #Trading #SovereignPro'>Standard Share</option>
                          <option value='Yikes. {roast} Stop gambling & audit here: https://roast-my-chart-app.vercel.app'>Aggressive Plug</option>
                          <option value='{roast} Audit your trades: https://roast-my-chart-app.vercel.app'>The Pro Pitch</option>
                          <option value='Humble yourself. {roast} Link: https://roast-my-chart-app.vercel.app'>The Humbler</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* The Aggressive Plug (CTAs) - Only show after roast is generated */}
        {roast && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
             {/* CTA 1: Free (Waitlist) */}
             <div onClick={() => setIsWaitlistOpen(true)} className="glass-panel p-6 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#00ff88]/50 transition-all flex flex-col justify-between group cursor-pointer">
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#00ff88] transition-colors">Sovereign Prop</h3>
                  <p className="text-gray-400 text-sm">Practice without losing rent money. The 100% Free Prop Firm Simulator.</p>
                </div>
                <div className="mt-6 text-[#00ff88] text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center">
                  Join the Waitlist <span className="ml-2">→</span>
                </div>
             </div>

             {/* CTA 2: Paid (Waitlist) */}
             <div onClick={() => setIsWaitlistOpen(true)} className="glass-panel flex-col flex p-6 rounded-xl border border-[#00ff88]/30 relative overflow-hidden group cursor-pointer hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] transition-all">
                {/* Glow effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00ff88]/20 blur-3xl group-hover:bg-[#00ff88]/30 transition-colors"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      Sovereign Pro
                      <span className="ml-3 text-[10px] uppercase tracking-wider bg-[#00ff88] text-black px-2 py-0.5 rounded-sm font-black">$19/mo</span>
                    </h3>
                    <p className="text-gray-300 text-sm">Stop trading like a gambler. Unlock the AI Coach (Tilt Tracker & Behavior Enforcement).</p>
                  </div>
                  <div className="mt-6 text-[#00ff88] text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center">
                    Join the Waitlist <span className="ml-2">→</span>
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Waitlist Modal */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in transition-all">
          <div className="glass-panel neon-border max-w-md w-full p-8 rounded-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => { setIsWaitlistOpen(false); setWaitlistSuccess(false); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <Terminal className="w-5 h-5 rotate-45" />
            </button>

            {!waitlistSuccess ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Join <span className="text-indigo-400">Sovereign</span> <span className="text-[#00ff88]">Pro</span></h2>
                  <p className="text-gray-400 text-sm">Our full trading dashboard, AI Coach, and prop firm infrastructure are almost ready. Be the first to get elite access.</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setWaitlistSuccess(true); }}>
                  <input 
                    type="email" 
                    required 
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="w-full bg-black/50 border border-white/10 p-4 rounded-xl focus:border-[#00ff88] outline-none transition-colors"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-[#00ff88] text-black font-black py-4 rounded-xl hover:bg-[#00cc6e] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                  >
                    Secure Spot
                  </button>
                </form>
                <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest">No spam. Just launch details. 🦅</p>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto">
                  <Terminal className="w-8 h-8 text-[#00ff88]" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">You're on the list!</h2>
                <p className="text-gray-400">Keep an eye on your inbox. We'll email you the moment the Sovereign Prop infrastructure is live.</p>
                <button 
                  onClick={() => { setIsWaitlistOpen(false); setWaitlistSuccess(false); }}
                  className="mt-6 text-[#00ff88] text-sm font-bold hover:underline"
                >
                  Back to Auditor
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Typewriter Component for the Roast
function Typewriter({ text, speed = 30 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    
    // Clear any existing intervals if text changes quickly
    const timerId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timerId);
      }
    }, speed);

    return () => clearInterval(timerId);
  }, [text, speed]);

  return (
    <p className="text-xl md:text-2xl leading-relaxed text-gray-200 min-h-[100px]">
      {displayedText}
      <span className={`inline-block w-3 h-6 bg-[#00ff88] align-middle ml-1 ${isTyping ? '' : 'animate-pulse'}`}></span>
    </p>
  );
}
