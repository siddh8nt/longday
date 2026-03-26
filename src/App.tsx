/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp, getDocFromServer, doc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { cn } from './lib/utils';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent, emailToSubmit?: string) => {
    e.preventDefault();
    const targetEmail = emailToSubmit || email;
    if (!targetEmail || !targetEmail.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      // 1. Store in Firestore
      await addDoc(collection(db, 'waitlist'), {
        email: targetEmail,
        createdAt: serverTimestamp(),
      });

      // 2. Call server API to "send email"
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (!response.ok) throw new Error('Failed to send welcome email');

      setStatus('success');
      setEmail('');
      if (isModalOpen) {
        setTimeout(() => setIsModalOpen(false), 2000);
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A08] text-[#F0EDE6] font-sans selection:bg-[#C8F135] selection:text-[#0A0A08]">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-10 border-b border-white/10 sticky top-0 bg-[#0A0A08] z-50">
        <div className="font-bebas text-2xl tracking-widest">
          Long<span className="text-[#C8F135]">day</span>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="font-mono text-[10px] md:text-xs tracking-widest px-5 py-2 border border-[#F0EDE6] hover:bg-[#F0EDE6] hover:text-[#0A0A08] transition-all uppercase"
        >
          Join Waitlist
        </button>
      </nav>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-[#111110] border border-white/10 p-8 md:p-12 max-w-[500px] w-full shadow-2xl"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#C8F135] mb-4">Early access</div>
              <h2 className="font-bebas text-4xl md:text-5xl leading-none mb-6">JOIN THE<br />WAITLIST</h2>
              <p className="text-sm font-light text-white/50 mb-8">Be the first to experience the AI that won't let you slack.</p>
              
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" 
                  disabled={status === 'loading' || status === 'success'}
                  className="bg-white/5 border border-white/10 text-[#F0EDE6] px-4 py-4 text-sm font-light outline-none focus:border-[#C8F135] disabled:opacity-50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="bg-[#C8F135] text-[#0A0A08] px-6 py-4 font-mono text-xs tracking-widest uppercase font-bold hover:bg-[#d9ff52] disabled:bg-white/20 disabled:text-white/50 transition-all flex items-center justify-center"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === 'success' ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    'Join Now'
                  )}
                  {status === 'success' && 'You\'re in'}
                </button>
              </form>
              
              {status === 'success' && (
                <p className="text-[#C8F135] text-[10px] font-mono mt-4">Welcome email sent. Check your inbox.</p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-[10px] font-mono mt-4">{errorMessage}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* HERO */}
      <section className="px-6 md:px-10 pt-20 pb-16 max-w-[1100px] mx-auto relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 text-[#C8F135] font-mono text-[10px] md:text-xs tracking-[0.18em] uppercase mb-6 before:content-[''] before:w-6 before:h-[1px] before:bg-[#C8F135]"
        >
          Accountability · AI · Behavior OS
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-bebas text-[clamp(3.5rem,10vw,8rem)] leading-[0.92] tracking-wider mb-8"
        >
          YOUR AI<br />
          THAT <span className="text-[#C8F135]">WON'T</span><br />
          LET YOU<br />
          SLACK.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl font-light text-white/60 max-w-[480px] leading-relaxed mb-10"
        >
          Drop tasks in WhatsApp or Instagram DMs. Longday's AI agent follows up, tracks your streaks, and keeps the pressure on — so you actually execute.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-6"
        >
          <button 
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#C8F135] text-[#0A0A08] font-mono text-sm tracking-widest uppercase px-8 py-4 font-medium hover:bg-[#d9ff52] hover:-translate-y-0.5 transition-all"
          >
            Join the Waitlist
          </button>
          <button className="flex items-center gap-2 text-white/50 hover:text-white font-mono text-xs tracking-widest uppercase transition-all group">
            See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* TICKER */}
        <div className="mt-12 border-y border-white/10 py-3 overflow-hidden bg-[#C8F135]/5">
          <div className="flex gap-12 whitespace-nowrap animate-ticker">
            {[...Array(2)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
                  <span className="text-[#C8F135]">■</span> Task input via DMs
                </span>
                <span className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
                  <span className="text-[#C8F135]">■</span> AI follow-up agent
                </span>
                <span className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
                  <span className="text-[#C8F135]">■</span> Streak tracking
                </span>
                <span className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
                  <span className="text-[#C8F135]">■</span> Behavioral pressure
                </span>
                <span className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
                  <span className="text-[#C8F135]">■</span> WhatsApp + Instagram
                </span>
                <span className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
                  <span className="text-[#C8F135]">■</span> HQ dashboard
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 py-20">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[#5A5A52] mb-12 after:content-[''] after:flex-1 after:h-[1px] after:bg-white/10 after:max-w-[60px]">
          The problem
        </div>
        <div className="grid md:grid-cols-2 border border-white/10 bg-white/10">
          <div className="bg-[#0A0A08] p-8">
            <div className="font-bebas text-6xl text-[#C8F135]/70 mb-2">87%</div>
            <h3 className="text-lg font-medium mb-2">Apps abandoned within a week</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              Notion, Todoist, Habitica — people set them up, feel productive, and ghost them in 5 days.
            </p>
          </div>
          <div className="bg-[#C8F135]/5 p-8">
            <div className="font-bebas text-6xl text-[#C8F135]/70 mb-2">0</div>
            <h3 className="text-lg font-medium mb-2">Real accountability built in</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              No existing productivity app follows up with you, tracks your excuses, or turns up the heat when you're slipping.
            </p>
          </div>
          <div className="bg-[#C8F135]/5 p-8">
            <div className="font-bebas text-6xl text-[#C8F135]/70 mb-2">∞</div>
            <h3 className="text-lg font-medium mb-2">Friction before you even start</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              Opening an app, navigating dashboards, logging tasks — it's enough overhead that people just don't bother.
            </p>
          </div>
          <div className="bg-[#0A0A08] p-8">
            <div className="font-bebas text-6xl text-[#C8F135]/70 mb-2">0</div>
            <h3 className="text-lg font-medium mb-2">Emotional intelligence in tools</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              Your tools don't know when to push harder, when to back off, or when you're in a pattern of failure.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 py-20 border-t border-white/10">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[#5A5A52] mb-12 after:content-[''] after:flex-1 after:h-[1px] after:bg-white/10 after:max-w-[60px]">
          How it works
        </div>
        <div className="grid md:grid-cols-3 border border-white/10 bg-white/10">
          <div className="bg-[#0A0A08] p-10">
            <span className="font-mono text-[10px] text-[#C8F135] tracking-widest mb-6 block">01 — Input</span>
            <h3 className="text-xl font-medium mb-3 leading-tight">Drop a task in your DMs</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              Message Longday on WhatsApp or Instagram like you'd text a friend. "Gym at 6pm." "Finish OS notes." No app-switching, no forms.
            </p>
          </div>
          <div className="bg-[#0A0A08] p-10">
            <span className="font-mono text-[10px] text-[#C8F135] tracking-widest mb-6 block">02 — Agent</span>
            <h3 className="text-xl font-medium mb-3 leading-tight">The AI shows up</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              At the right time, it asks: did you do it? It tracks your answer, adjusts its tone — gentle, then firm, then relentless — based on your history.
            </p>
          </div>
          <div className="bg-[#0A0A08] p-10">
            <span className="font-mono text-[10px] text-[#C8F135] tracking-widest mb-6 block">03 — HQ</span>
            <h3 className="text-xl font-medium mb-3 leading-tight">Your execution dashboard</h3>
            <p className="text-sm font-light text-white/50 leading-relaxed">
              See your completion rates, streaks, and behavioral trends in one place. Not a task list — a mirror of how you actually operate.
            </p>
          </div>
        </div>
      </section>

      {/* MOCKUP */}
      <section className="bg-[#C8F135]/3 border-y border-white/10 py-20 px-6 md:px-10">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[#5A5A52] mb-6 after:content-[''] after:flex-1 after:h-[1px] after:bg-white/10 after:max-w-[60px]">
              The DM interface
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] mb-6">
              WORKS WHERE<br />YOU <span className="text-[#C8F135]">ALREADY</span><br />ARE.
            </h2>
            <p className="text-base font-light text-white/55 leading-relaxed max-w-[380px]">
              No new apps to open. No new habits to build around the tool. You already check Instagram and WhatsApp. Longday lives there — and it won't let you ignore it.
            </p>
          </div>
          
          <div className="bg-[#111110] border border-white/15 rounded-[20px] p-6 max-w-[300px] mx-auto shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#C8F135] flex items-center justify-center font-mono text-[10px] text-[#0A0A08] font-bold">LD</div>
              <div>
                <div className="text-sm font-medium">Longday</div>
                <div className="text-[10px] text-[#C8F135]">● active</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col items-end">
                <div className="bg-[#C8F135] text-[#0A0A08] px-4 py-2.5 rounded-[12px_4px_12px_12px] text-xs leading-relaxed max-w-[85%] font-medium">
                  gym at 7pm today, and OS chapter 4 before midnight
                </div>
                <span className="text-[9px] text-[#5A5A52] mt-1 font-mono">6:45 PM</span>
              </div>
              
              <div className="flex flex-col items-start">
                <div className="bg-white/10 text-[#F0EDE6] px-4 py-2.5 rounded-[4px_12px_12px_12px] text-xs leading-relaxed max-w-[85%] font-light">
                  Got it. I'll check in at 7:30 on the gym, and at 11:30 on OS. Don't make me ask twice.
                </div>
                <span className="text-[9px] text-[#5A5A52] mt-1 font-mono">6:45 PM</span>
              </div>

              <div className="flex flex-col items-start">
                <div className="bg-white/10 text-[#F0EDE6] px-4 py-2.5 rounded-[4px_12px_12px_12px] text-xs leading-relaxed max-w-[85%] font-light">
                  Hey. It's 7:35. Did you make it to the gym?
                </div>
                <span className="text-[9px] text-[#5A5A52] mt-1 font-mono">7:35 PM</span>
              </div>

              <div className="flex flex-col items-end">
                <div className="bg-[#C8F135] text-[#0A0A08] px-4 py-2.5 rounded-[12px_4px_12px_12px] text-xs leading-relaxed max-w-[85%] font-medium">
                  yeah just finished
                </div>
                <span className="text-[9px] text-[#5A5A52] mt-1 font-mono">7:51 PM</span>
              </div>

              <div className="flex flex-col items-start">
                <div className="bg-white/10 text-[#F0EDE6] px-4 py-2.5 rounded-[4px_12px_12px_12px] text-xs leading-relaxed max-w-[85%] font-light">
                  Good. That's 4 days straight. OS at 11:30 — I'll be there.
                </div>
                <span className="text-[9px] text-[#5A5A52] mt-1 font-mono">7:51 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 py-24 text-center">
        <blockquote className="font-bebas text-[clamp(2.5rem,6vw,5.5rem)] leading-none tracking-wide">
          PEOPLE DON'T FAIL<br />FOR LACK OF <span className="text-[#C8F135]">TOOLS.</span><br />THEY FAIL FOR LACK<br />OF PRESSURE.
        </blockquote>
        <p className="mt-8 font-mono text-[10px] tracking-[0.18em] uppercase text-[#5A5A52]">
          — The Longday thesis
        </p>
      </section>

      {/* CTA FOOTER */}
      <section id="waitlist" className="border-t border-white/10 py-20 px-6 md:px-10 text-center bg-[#C8F135]/[0.025]">
        <div className="flex justify-center items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[#5A5A52] mb-6">
          Early access
        </div>
        <h2 className="font-bebas text-[clamp(2.5rem,6vw,5rem)] leading-none mb-4">
          STOP PLANNING.<br />START EXECUTING.
        </h2>
        <p className="text-sm font-light text-white/50 mb-10">
          Waitlist is open. First 100 users get free access.
        </p>
        
        <form onSubmit={handleWaitlistSubmit} className="max-w-[420px] mx-auto flex flex-col sm:flex-row gap-0">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" 
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 bg-white/10 border border-white/20 text-[#F0EDE6] px-4 py-3.5 text-sm font-light outline-none focus:border-[#C8F135] disabled:opacity-50 transition-all"
          />
          <button 
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="bg-[#C8F135] text-[#0A0A08] px-6 py-3.5 font-mono text-xs tracking-widest uppercase font-bold hover:bg-[#d9ff52] disabled:bg-white/20 disabled:text-white/50 transition-all flex items-center justify-center min-w-[140px]"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              'Join Now'
            )}
          </button>
        </form>
        
        {status === 'success' && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#C8F135] text-xs font-mono mt-4"
          >
            You're on the list. We'll be in touch.
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs font-mono mt-4"
          >
            {errorMessage}
          </motion.p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-10 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-bebas text-lg tracking-widest">
          Long<span className="text-[#C8F135]">day</span>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-[#5A5A52]">
          © 2025 Longday.io — Built for people who mean it.
        </p>
      </footer>
    </div>
  );
}
