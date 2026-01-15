"use client";

import { useState, useEffect } from "react";
import { Film, Book, Gamepad2, Music, CheckCircle2, ChevronRight, Loader2, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = "movies" | "books" | "games" | "music";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("movies");
  const [movieQuery, setMovieQuery] = useState("");
  const [email, setEmail] = useState("");
  const [optionalQuery, setOptionalQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for simple animations
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMovieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = movieQuery.trim().replace(/\s+/g, " ");
    const words = q.split(" ").filter(Boolean);
    
    if (q.length < 6 || words.length < 3) {
      setErrorMessage("Please describe it in a few more words.");
      return;
    }

    const url = new URL("https://findbyvibe.com/find-movie-by-plot");
    url.searchParams.set("q", q);
    url.searchParams.set("utm_source", "tipofmy");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "portal");
    window.location.href = url.toString();
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category: activeTab,
          query: optionalQuery,
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "submit_failed");

      setStatus("success");
      setEmail("");
      setOptionalQuery("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message === "submit_failed" ? "Something went wrong. Please try again." : err.message);
    }
  };

  const tabs = [
    { id: "movies", label: "Movies", icon: Film, badge: "Live" },
    { id: "books", label: "Books", icon: Book, badge: "Soon" },
    { id: "games", label: "Games", icon: Gamepad2, badge: "Soon" },
    { id: "music", label: "Music", icon: Music, badge: "Soon" },
  ] as const;

  const waitlistContent = {
    books: {
      witty: "Our AI is currently speed-reading the entire library of humanity.",
      placeholder: "Describe the book's plot..."
    },
    games: {
      witty: "Our AI is pressing every button in existence (for science).",
      placeholder: "Describe the gameplay or story..."
    },
    music: {
      witty: "Our AI is humming every melody it can remember.",
      placeholder: "Describe the melody or lyrics..."
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply" />

      {/* Header */}
      <header className={`text-center mb-10 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-2xl font-semibold tracking-tight text-gray-900">TipOfMy</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide border border-gray-200">Beta</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight leading-[1.1]">
          Find what you<br className="md:hidden" /> can’t name.
        </h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
           Describe the plot, scene, or vibe. <span className="text-gray-900 font-medium">We’ll handle the rest.</span>
        </p>
      </header>

      {/* Main Card */}
      <div className={`w-full max-w-[720px] glass-panel rounded-3xl p-2 shadow-2xl ring-1 ring-black/5 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        
        {/* Apple-style Segmented Control */}
        <div className="flex p-1 bg-gray-100/80 backdrop-blur-md rounded-2xl mb-2 relative">
           {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setStatus("idle");
                setErrorMessage("");
              }}
              className={cn(
                "flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 ease-apple flex items-center justify-center gap-2 rounded-xl",
                activeTab === tab.id ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon size={16} strokeWidth={2.5} className={cn("transition-transform duration-300", activeTab === tab.id ? "scale-110" : "scale-100")} />
              <span>{tab.label}</span>
              {tab.badge === "Soon" && (
                  <span className="hidden md:inline-block ml-1 text-[9px] bg-gray-200/50 text-gray-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Waitlist
                  </span>
              )}
            </button>
          ))}
          
          {/* Animated Background Slider */}
          <div 
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm border border-black/5 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
                left: `calc(${(tabs.findIndex(t => t.id === activeTab) * 100) / 4}% + 4px)`,
                width: `calc(${100 / 4}% - 8px)`
            }}
          />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 min-h-[320px] flex flex-col justify-center relative overflow-hidden">
            
            {/* Animated Content Switcher */}
            <div className="transition-all duration-500 ease-apple">
              {activeTab === "movies" ? (
                <form onSubmit={handleMovieSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="relative group">
                    <div className="absolute top-4 left-4 text-gray-400">
                        <Search size={20} />
                    </div>
                    <textarea
                      value={movieQuery}
                      onChange={(e) => {
                        setMovieQuery(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder='e.g., "A guy relives the same day at a wedding on an island…"'
                      className="w-full h-40 pl-12 pr-4 py-4 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl border-2 border-transparent focus:border-[#0071e3]/20 focus:ring-4 focus:ring-[#0071e3]/10 transition-all outline-none resize-none text-gray-800 placeholder:text-gray-400 text-lg leading-relaxed"
                    />
                  </div>
                  
                  {errorMessage && (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <p className="text-xs text-gray-400 font-medium">
                        Powered by <span className="text-gray-900">FindByVibe</span> intelligence
                      </p>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full font-semibold text-base transition-all transform active:scale-95 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
                      >
                        Find Movie
                        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                  </div>
                </form>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {status === "success" ? (
                    <div className="text-center py-12 space-y-6">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4 ring-8 ring-green-50">
                        <CheckCircle2 size={40} />
                      </div>
                      <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">You’re on the list!</h3>
                          <p className="text-gray-500">We’ll email you when {activeTab} search is ready.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("movies")}
                        className="text-[#0071e3] font-medium hover:underline text-sm"
                      >
                        Try searching for a movie instead
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-10 space-y-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center text-gray-900 mb-2">
                            {activeTab === 'books' && <Book size={24} />}
                            {activeTab === 'games' && <Gamepad2 size={24} />}
                            {activeTab === 'music' && <Music size={24} />}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                             Coming Soon
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto text-balance">
                          {waitlistContent[activeTab as keyof typeof waitlistContent].witty}
                        </p>
                      </div>

                      <form onSubmit={handleWaitlistSubmit} className="space-y-4 max-w-md mx-auto">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-5 py-3.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all outline-none"
                        />
                        <div className="relative">
                            <input
                            value={optionalQuery}
                            onChange={(e) => setOptionalQuery(e.target.value)}
                            placeholder={waitlistContent[activeTab as keyof typeof waitlistContent].placeholder + " (Optional)"}
                            className="w-full px-5 py-3.5 bg-gray-50 hover:bg-white focus:bg-white rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all outline-none"
                            />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={status === "submitting"}
                          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-black/5"
                        >
                          {status === "submitting" ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Joining...
                            </>
                          ) : (
                            "Notify Me When Ready"
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="mt-16 flex flex-col md:flex-row items-center gap-6 text-sm text-gray-400 font-medium">
        <span>© 2026 TipOfMy.com</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          <a href="mailto:hello@tipofmy.com" className="hover:text-gray-600 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  );
}