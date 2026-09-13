import React from 'react';
import { Skull, Eye } from 'lucide-react';
import { IMAGES } from '../data/mockData';

export default function LandingPage({ onNavigate, onOpenReport, onOpenBrowse, user }) {
  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 pb-20 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-[#d2bbff]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-[#ffb0cd]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Hero Content */}
          <div className="flex flex-col gap-8">
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#e5e1e4] leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-[#d2bbff] to-[#ffb0cd] bg-clip-text text-transparent">
                Lost It? Bro, We Got You.
              </span>
            </h1>

            <p className="font-['Inter'] text-base md:text-lg text-[#A1A1AA] max-w-xl leading-relaxed">
              Your stuff went missing. Again? Let’s get it back before you start blaming everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={onOpenReport}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold flex items-center justify-center gap-3 primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-base group"
              >
                <Skull className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                Bro I Lost It
              </button>
              <button
                onClick={onOpenBrowse}
                className="px-8 py-4 rounded-xl glass-card text-white font-bold flex items-center justify-center gap-3 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer text-base group"
              >
                <Eye className="w-5 h-5 text-[#d2bbff] group-hover:scale-110 transition-transform duration-200" />
                Bro Found It?
              </button>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <div className="flex -space-x-3">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#131315] bg-[#18181B] bg-cover bg-center"
                  style={{ backgroundImage: `url('${IMAGES.avatarWoman}')` }}
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#131315] bg-[#18181B] bg-cover bg-center"
                  style={{ backgroundImage: `url('${IMAGES.avatarMan1}')` }}
                />
                <div 
                  className="w-10 h-10 rounded-full border-2 border-[#131315] bg-[#18181B] bg-cover bg-center"
                  style={{ backgroundImage: `url('${IMAGES.avatarMan2}')` }}
                />
              </div>
              <p className="text-sm text-[#A1A1AA]">
                <span className="text-white font-bold">12k+</span> people already locked in
              </p>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative flex justify-center items-center h-[450px] md:h-[550px]">
            {/* Floating Status Card 1: Lost Keys */}
            <div className="absolute top-2 -left-2 sm:left-2 glass-card px-4 py-3 rounded-2xl floating delay-1 z-20 flex items-center gap-3.5 shadow-2xl border border-white/15 bg-[#131316]/85 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#d2bbff]/10 border border-[#7C3AED]/30 flex items-center justify-center text-[#d2bbff] shadow-inner">
                <span className="material-symbols-outlined text-[20px]">key</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <p className="text-xs font-bold text-white tracking-wide">Lost Keys</p>
                </div>
                <p className="text-[11px] text-[#A1A1AA] font-medium mt-0.5">Found. Somehow.</p>
              </div>
            </div>

            {/* Floating Status Card 2: Earphone Found */}
            <div className="absolute bottom-4 -right-2 sm:right-2 glass-card px-4 py-3 rounded-2xl floating-alt delay-2 z-20 flex items-center gap-3.5 shadow-2xl border border-white/15 bg-[#131316]/85 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EC4899]/30 to-[#ffb0cd]/10 border border-[#EC4899]/30 flex items-center justify-center text-[#ffb0cd] shadow-inner">
                <span className="material-symbols-outlined text-[20px]">headphones</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <p className="text-xs font-bold text-white tracking-wide">Earphone Found</p>
                </div>
                <p className="text-[11px] text-[#A1A1AA] font-medium mt-0.5">
                  Last seen: “bro trust me, they're somewhere here”
                </p>
              </div>
            </div>

            {/* Floating Status Card 3: Safe Return */}
            <div className="absolute bottom-6 left-2 sm:left-4 hidden md:flex glass-card px-3.5 py-2.5 rounded-2xl floating delay-3 z-20 items-center gap-2.5 shadow-2xl border border-white/15 bg-[#131316]/85 backdrop-blur-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Crisis Averted</p>
                <p className="text-[10px] text-emerald-400 font-medium">Just now</p>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="w-full h-full flex justify-center items-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/20 to-[#EC4899]/20 rounded-3xl filter blur-3xl opacity-60 -z-10"></div>
              <img
                src={IMAGES.heroIllustration || IMAGES.astronautHero}
                alt="AI-Powered Lost and Found Smart Search Illustration"
                className="w-[88%] md:w-[92%] max-h-[500px] object-cover rounded-3xl shadow-2xl floating border border-[#3F3F46]/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#0e0e10] border-y border-[#3F3F46]/40">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-4">
              Because “I Swear I Left It Here” Isn’t Enough
            </h2>
            <p className="text-base text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              No more WhatsApp spam. No more “has anyone seen my AirPods?”
              <br className="hidden sm:inline" /> Just search, match, and get your stuff back. We help lost things find their way back home using tech + people power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div 
              onClick={onOpenReport}
              className="glass-card p-8 rounded-3xl group cursor-pointer hover:border-[#7C3AED] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#d2bbff]/10 flex items-center justify-center text-[#d2bbff] mb-6 group-hover:bg-[#7C3AED] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">add_box</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-3">
                Oops… I Lost Something
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Tell us what went missing. Add a photo, location, and a few details. We’ll help you hunt it down.
              </p>
              <span className="flex items-center gap-2 text-[#d2bbff] font-bold text-sm group-hover:gap-3 transition-all">
                Let’s Find It <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>

            {/* Feature 2 */}
            <div 
              onClick={onOpenBrowse}
              className="glass-card p-8 rounded-3xl group cursor-pointer hover:border-[#EC4899] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#ffb0cd]/10 flex items-center justify-center text-[#ffb0cd] mb-6 group-hover:bg-[#EC4899] group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">grid_view</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-3">
                Wait… Someone Found It?
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Don't panic. They might actually be trying to return it. Browse found items and see if your missing stuff is waiting for you.
              </p>
              <span className="flex items-center gap-2 text-[#ffb0cd] font-bold text-sm group-hover:gap-3 transition-all">
                Explore Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>

            {/* Feature 3 */}
            <div 
              onClick={() => user ? onNavigate('dashboard') : onNavigate('login')}
              className="glass-card p-8 rounded-3xl group cursor-pointer hover:border-[#ffb784] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#ffb784]/10 flex items-center justify-center text-[#ffb784] mb-6 group-hover:bg-[#ffb784] group-hover:text-black transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-3">
                Trust Issues? Fair.
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                We verify people and items so you can return your stuff without the sketchy vibes. We make sure the right stuff gets back to the right person.
              </p>
              <span className="flex items-center gap-2 text-[#ffb784] font-bold text-sm group-hover:gap-3 transition-all">
                See How <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Detective Workstation Image Container */}
            <div className="relative rounded-3xl overflow-hidden glass-card aspect-square max-w-md mx-auto md:ml-0 shadow-2xl border border-[#7C3AED]/40">
              <img
                src={IMAGES.detectiveScan || IMAGES.labScanning}
                alt="AI Detective Investigation Hologram"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131315]/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-card px-4 py-2.5 rounded-2xl flex items-center justify-between border border-white/10 bg-[#131316]/80 backdrop-blur-xl">
                  <span className="text-[#d2bbff] text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-ping"></span>
                    Detective Mode Active
                  </span>
                  <span className="text-[10px] text-[#A1A1AA] font-mono">
                    Suspects: 47 • Clues: 0
                  </span>
                </div>
              </div>
            </div>

            {/* Steps Column */}
            <div className="flex flex-col gap-10">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-3">
                  How We Get Your Stuff Back
                </h2>
                <p className="text-[#A1A1AA] text-base">
                  You lose it. We do the detective work.
                </p>
              </div>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-5 sm:gap-6 items-start group">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl border border-[#7C3AED]/50 flex items-center justify-center font-bold text-[#d2bbff] bg-[#7C3AED]/15 text-base shadow-lg group-hover:scale-105 group-hover:border-[#7C3AED] transition-all">
                      01
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white">
                        I Lost It. Oops.
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#d2bbff] bg-[#7C3AED]/15 border border-[#7C3AED]/30">
                        “Yeah... that wasn't supposed to happen.”
                      </span>
                    </div>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed pt-0.5">
                      Drop the details, add a photo, and tell us where you last saw it.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5 sm:gap-6 items-start group">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl border border-[#EC4899]/50 flex items-center justify-center font-bold text-[#ffb0cd] bg-[#EC4899]/15 text-base shadow-lg group-hover:scale-105 group-hover:border-[#EC4899] transition-all">
                      02
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white">
                        We Go Hunting
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#ffb0cd] bg-[#EC4899]/15 border border-[#EC4899]/30">
                        “Detective mode: activated.”
                      </span>
                    </div>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed pt-0.5">
                      We check reported items and look for possible matches. No detective degree required — that’s what the haters will say.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5 sm:gap-6 items-start group">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl border border-[#ffb784]/50 flex items-center justify-center font-bold text-[#ffb784] bg-[#ffb784]/15 text-base shadow-lg group-hover:scale-105 group-hover:border-[#ffb784] transition-all">
                      03
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white">
                        Plot Twist: It’s Found
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#ffb784] bg-[#ffb784]/15 border border-[#ffb784]/30">
                        “And they lived happily ever after.”
                      </span>
                    </div>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed pt-0.5">
                      Connect with the finder and get your stuff back safely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large CTA Section */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="relative bg-gradient-to-br from-[#7C3AED] to-[#EC4899] rounded-[2.5rem] p-10 md:p-20 overflow-hidden text-center shadow-2xl">
            {/* Pattern Overlay */}
            <div 
              className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}
            />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/20 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                Still looking for your stuff?
              </h2>
              <p className="text-white/80 text-base md:text-lg max-w-2xl">
                Don't worry, we're already on the case. Report it, search for it, and let the detective work begin.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                <button
                  onClick={onOpenReport}
                  className="px-10 py-4 rounded-2xl bg-white text-[#7C3AED] font-bold text-base hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                >
                  Get Started for Free
                </button>
                <button
                  onClick={() => user ? onNavigate('dashboard') : onNavigate('login')}
                  className="px-10 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-all cursor-pointer"
                >
                  {user ? 'Go to Dashboard' : 'Sign In'}
                </button>
              </div>

              <p className="text-white/60 text-xs mt-2">
                No credit card required. Free to search, always.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
