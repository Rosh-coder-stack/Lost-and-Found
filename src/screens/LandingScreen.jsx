import React from 'react';
import { IMAGES } from '../data/mockData';

export default function LandingScreen({ onNavigate, onOpenReport, onOpenBrowse }) {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d2bbff]/10 border border-[#d2bbff]/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#d2bbff] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#d2bbff] uppercase tracking-wider">
                Now Live: Version 2.0
              </span>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-[48px] font-bold text-[#e5e1e4] leading-[1.1] tracking-tight">
              Lost something? <br />
              <span className="bg-gradient-to-r from-[#d2bbff] to-[#ffb0cd] bg-clip-text text-transparent">
                Let's help you find it.
              </span>
            </h1>

            <p className="font-['Inter'] text-base md:text-lg text-[#A1A1AA] max-w-xl leading-relaxed">
              The world's most advanced lost and found network. Powered by smart matching and a global community to reunite you with your belongings faster than ever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={onOpenReport}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold flex items-center justify-center gap-2 primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">report</span>
                Report Lost Item
              </button>
              <button
                onClick={onOpenBrowse}
                className="px-8 py-4 rounded-xl glass-card text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">search</span>
                Browse Found Items
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
                Joined by <span className="text-white font-bold">12k+</span> users this month
              </p>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative flex justify-center items-center h-[450px] md:h-[550px]">
            {/* Floating Glass Card 1 */}
            <div className="absolute top-6 left-2 sm:left-6 glass-card p-4 rounded-2xl floating delay-1 z-20 flex items-center gap-3 w-48 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-[#d2bbff]/20 flex items-center justify-center text-[#d2bbff]">
                <span className="material-symbols-outlined">key</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Lost Keys</p>
                <p className="text-[10px] text-[#A1A1AA]">Found 2m ago</p>
              </div>
            </div>

            {/* Floating Glass Card 2 */}
            <div className="absolute bottom-12 right-2 sm:right-6 glass-card p-4 rounded-2xl floating delay-2 z-20 flex items-center gap-3 w-56 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-[#ffb0cd]/20 flex items-center justify-center text-[#ffb0cd]">
                <span className="material-symbols-outlined">smartphone</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">iPhone 15 Pro</p>
                <p className="text-[10px] text-[#A1A1AA]">Central Park, NY</p>
              </div>
            </div>

            {/* Astronaut Image */}
            <div className="w-full h-full flex justify-center items-center">
              <img
                src={IMAGES.astronautHero}
                alt="Astronaut Lost and Found 3D Illustration"
                className="w-[85%] md:w-[90%] max-h-[500px] object-contain drop-shadow-2xl floating"
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
              Reinventing the Search
            </h2>
            <p className="text-base text-[#A1A1AA]">
              Our platform combines cutting-edge technology with community trust to ensure your items always find their way back home.
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
                Report Lost Item
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Quickly document your missing belongings with our intuitive reporting tool. Add descriptions, locations, and photos in seconds.
              </p>
              <span className="flex items-center gap-2 text-[#d2bbff] font-bold text-sm group-hover:gap-3 transition-all">
                Get Started <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
                Browse Found Items
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Search through our global database of recovered items. Advanced filters and AI-assisted matching help you find your match.
              </p>
              <span className="flex items-center gap-2 text-[#ffb0cd] font-bold text-sm group-hover:gap-3 transition-all">
                Explore Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>

            {/* Feature 3 */}
            <div 
              onClick={() => onNavigate('login')}
              className="glass-card p-8 rounded-3xl group cursor-pointer hover:border-[#ffb784] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#ffb784]/10 flex items-center justify-center text-[#ffb784] mb-6 group-hover:bg-[#ffb784] group-hover:text-black transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-3">
                Secure Accounts
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                Verify your identity and item ownership through our secure verification process. Your privacy and security are our top priorities.
              </p>
              <span className="flex items-center gap-2 text-[#ffb784] font-bold text-sm group-hover:gap-3 transition-all">
                Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Lab Image Container */}
            <div className="relative rounded-3xl overflow-hidden glass-card aspect-square max-w-md mx-auto md:ml-0 shadow-2xl">
              <img
                src={IMAGES.labScanning}
                alt="AI Database Hologram Scanner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131315] via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <div className="glass-card px-4 py-2 rounded-full inline-block">
                  <span className="text-[#d2bbff] text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d2bbff] animate-ping"></span>
                    Scanning Global Database...
                  </span>
                </div>
              </div>
            </div>

            {/* Steps Column */}
            <div className="flex flex-col gap-10">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-3">
                  How FoundIt Works
                </h2>
                <p className="text-[#A1A1AA] text-base">
                  Reuniting you with your valuables in three simple steps.
                </p>
              </div>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#7C3AED] flex items-center justify-center font-bold text-[#d2bbff] bg-[#7C3AED]/10 text-lg">
                    1
                  </div>
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-1">
                      Report
                    </h4>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                      Provide details about what was lost. Our AI immediately starts indexing the entry and looking for potential matches.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#EC4899] flex items-center justify-center font-bold text-[#ffb0cd] bg-[#EC4899]/10 text-lg">
                    2
                  </div>
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-1">
                      Match
                    </h4>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                      We notify you instantly when a probable match is found. Our system cross-references location, time, and visual features.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#ffb784] flex items-center justify-center font-bold text-[#ffb784] bg-[#ffb784]/10 text-lg">
                    3
                  </div>
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-1">
                      Recover
                    </h4>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                      Coordinate a safe meeting or shipment through our secure messaging system and claim your item back.
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
                Ready to find what you've lost?
              </h2>
              <p className="text-white/80 text-base md:text-lg">
                Join thousands of users who have successfully recovered their items using FoundIt. Start your report today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                <button
                  onClick={onOpenReport}
                  className="px-10 py-4 rounded-2xl bg-white text-[#7C3AED] font-bold text-base hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                >
                  Get Started for Free
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-10 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-all cursor-pointer"
                >
                  Contact Support
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
