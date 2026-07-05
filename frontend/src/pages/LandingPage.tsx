import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Search, Zap, CheckCircle2, Lock, FileSearch, Check } from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-brand-500/30">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-900/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[80%] rounded-full bg-indigo-900/20 blur-[150px] mix-blend-screen opacity-50"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Veridion AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-medium bg-white text-slate-950 px-5 py-2.5 rounded-full hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-8 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          The Future of M&A Deals
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-5xl">
          The AI Virtual Data Room Built for <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Modern Due Diligence
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed">
          Transform complex deal reviews into intelligent conversations. Veridion AI combines secure document exchange, AI-powered analysis, and risk intelligence, helping companies share with confidence and investors decide with clarity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95">
            Start for free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="flex items-center justify-center px-8 py-4 rounded-full font-semibold text-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm">
            Sign in to Workspace
          </Link>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Due diligence powers every major deal. But it slows things down too.<br />
            Every merger, acquisition, or investment depends on one critical process:<br />
            <strong className="text-white font-semibold mt-2 block">Can the buyer understand the company without exposing the seller to any risk?</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Buyer Challenge Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-brand-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="w-12 h-12 bg-brand-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">The Buyer's Challenge</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              For buyers, due diligence means searching through thousands of pages of:
            </p>
            <ul className="space-y-2 text-slate-300 mb-6">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Financial statements</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Customer contracts</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Legal agreements</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Compliance records</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Employee documents</li>
            </ul>
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-200 text-sm">
              Finding a single hidden liability can take weeks. A missed clause. An unusual dependency. Any overlooked detail can change the outcome of the deal.
            </div>
          </div>

          {/* Seller Challenge Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">The Seller's Challenge</h3>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Sellers face the exact opposite challenge. Sharing sensitive company data means exposing:
            </p>
            <ul className="space-y-2 text-slate-300 mb-6">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Revenue details</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Customer relationships</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Intellectual property</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Internal operations</li>
            </ul>
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-200 text-sm mt-auto">
              Even with legal agreements in place, once information leaves their control, visibility disappears.
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <p className="text-xl font-medium">
              Modern deals need both: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold">Buyer confidence. Seller control.</span>
            </p>
          </div>
        </div>
      </section>

      {/* The Evolution Section */}
      <section className="relative z-10 py-24 bg-slate-900/30 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">The Evolution of Due Diligence</h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xl md:text-2xl font-medium text-slate-400 mb-12">
            <span>File Sharing</span>
            <ArrowRight className="hidden md:block w-6 h-6 text-slate-600" />
            <span>Virtual Data Rooms</span>
            <ArrowRight className="hidden md:block w-6 h-6 text-slate-600" />
            <span className="text-white font-bold px-4 py-2 rounded-xl bg-white/10 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]">Intelligent Deal Rooms</span>
          </div>

          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Virtual Data Rooms (VDRs) transformed dealmaking by creating a secure bridge between companies. They solved the problem of access.<br /><br />
            <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-bold text-2xl">Now We solve the problem of understanding.</strong>
          </p>
        </div>
      </section>

      {/* Features & AI Chat Section */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Meet Veridion AI</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The intelligent layer between companies and investors. Veridion AI brings artificial intelligence into the due diligence workflow, allowing both sides of a transaction to move faster without sacrificing trust.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Features Lists */}
          <div className="space-y-8">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-400" /> For Sellers
              </h3>
              <ul className="space-y-4">
                {[
                  "Maintain a secure source of truth",
                  "Control document access",
                  "Track buyer activity",
                  "Protect confidential information",
                  "Share confidently"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FileSearch className="w-6 h-6 text-blue-400" /> For Buyers
              </h3>
              <ul className="space-y-4">
                {[
                  "Analyze thousands of documents instantly",
                  "Ask natural language questions",
                  "Receive source-backed answers",
                  "Identify hidden risks automatically",
                  "Make faster investment decisions"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Chat Graphic */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-b from-brand-500 to-purple-600 rounded-[2.5rem] blur opacity-20"></div>
            <div className="relative bg-[#0F172A] border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[600px]">

              {/* Chat Header */}
              <div className="border-b border-slate-800 p-4 bg-slate-900/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Veridion AI Assistant</h4>
                  <p className="text-xs text-blue-400">Analyzing 1,204 Deal Documents</p>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col justify-center">

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%] shadow-md">
                    <p className="text-sm">What risks should I know before acquiring this company?</p>
                  </div>
                </div>

                {/* AI Loading/Typing (Visual effect) */}
                <div className="flex items-center gap-2 text-slate-500 text-sm ml-2">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm p-5 max-w-[95%] shadow-lg relative">

                    <p className="text-sm mb-4 font-medium">I found 3 potential concerns in the latest disclosure batch:</p>

                    <div className="space-y-3 mb-5">
                      <div className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-rose-500/20 text-rose-400 text-xs font-bold shrink-0 mt-0.5">1</span>
                        <p className="text-sm text-slate-300"><strong>72% revenue dependency</strong> on a single enterprise customer.</p>
                      </div>
                      <div className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">2</span>
                        <p className="text-sm text-slate-300"><strong>Pending compliance renewal</strong> for ISO 27001 certification.</p>
                      </div>
                      <div className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                        <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">3</span>
                        <p className="text-sm text-slate-300"><strong>Customer contract termination risk</strong> within 30 days notice.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Sources Referenced</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-blue-300"><Check className="w-3 h-3" /> customer_contract.pdf</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-blue-300"><Check className="w-3 h-3" /> compliance_report.pdf</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Chat Input */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                <div className="bg-slate-800/50 border border-slate-700 rounded-full p-1 pl-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Ask a follow up question...</span>
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative border-t border-white/10 bg-slate-950 mt-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-brand-900/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to transform your deals?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-slate-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              Create an Account
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full font-bold text-lg border border-white/20 text-white hover:bg-white/5 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
