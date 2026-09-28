import Link from "next/link";
import { ArrowRight, Shield, Zap, BarChart, Globe, Users, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#f99d1c] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#11253e] to-[#1e3c63] rounded-xl flex items-center justify-center shadow-lg shadow-[#11253e]/20">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-black text-[#11253e] tracking-tight">SahajCRM<span className="text-[#f99d1c]">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-500">
            <a href="#features" className="hover:text-[#11253e] transition-colors">Features</a>
            <a href="#solutions" className="hover:text-[#11253e] transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-[#11253e] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="hidden md:inline-flex px-5 py-2.5 font-bold text-[#11253e] hover:bg-gray-50 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 font-bold text-white bg-[#11253e] hover:bg-[#1e3c63] rounded-xl shadow-lg shadow-[#11253e]/20 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#f99d1c]/10 to-transparent blur-3xl -z-10 rounded-full" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-blue-100/40 blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[#f99d1c] font-semibold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f99d1c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f99d1c]"></span>
            </span>
            SahajCRM Admin Platform 2.0 is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#11253e] tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            The intelligent hub for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#11253e] to-[#f99d1c]">growing enterprise.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Unify your company management, streamline communication, and empower your teams with a central dashboard designed for modern business operations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 font-bold text-white bg-[#f99d1c] hover:bg-[#e08b17] rounded-2xl shadow-xl shadow-[#f99d1c]/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 font-bold text-[#11253e] bg-white border-2 border-gray-100 hover:border-[#11253e]/10 hover:bg-gray-50 rounded-2xl transition-all"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by innovative companies worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center grayscale opacity-50">
            <div className="text-2xl font-black text-gray-800 tracking-tighter">HUTECH</div>
            <div className="text-2xl font-black text-gray-800 tracking-tighter flex items-center gap-1"><Zap size={24} className="fill-current"/> BOLT</div>
            <div className="text-2xl font-black text-gray-800 tracking-widest uppercase">Nexus</div>
            <div className="text-2xl font-black text-gray-800 tracking-tighter font-serif italic">GlobalTech</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-[#11253e] mb-6 tracking-tight">Everything you need to scale</h2>
            <p className="text-lg text-gray-500">Powerful features out of the box, engineered to provide unparalleled control over your organizational data.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield size={28} className="text-[#f99d1c]"/>}
              title="Enterprise Security"
              description="Bank-grade encryption, enforced Multi-Factor Authentication (MFA), and role-based access control built in."
            />
            <FeatureCard 
              icon={<Globe size={28} className="text-[#11253e]"/>}
              title="Multi-Tenant Portals"
              description="Dynamically create isolated dashboards for different companies, branches, or clients instantly."
            />
            <FeatureCard 
              icon={<Users size={28} className="text-[#f99d1c]"/>}
              title="Team Management"
              description="Onboard employees, manage credentials, and assign granular permissions with just a few clicks."
            />
            <FeatureCard 
              icon={<BarChart size={28} className="text-[#11253e]"/>}
              title="Real-time Analytics"
              description="Transform raw operational data into actionable insights with beautiful, automated reports."
            />
            <FeatureCard 
              icon={<Zap size={28} className="text-[#f99d1c]"/>}
              title="Lightning Fast"
              description="Built on Next.js 14 App Router and optimized for instantaneous navigation and zero loading states."
            />
            <FeatureCard 
              icon={<CheckCircle2 size={28} className="text-[#11253e]"/>}
              title="Lead Tracking"
              description="Integrated CRM capabilities to capture, nurture, and close leads directly from your dashboard."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#11253e] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#f99d1c]/20 to-transparent blur-3xl rounded-full" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to transform your workflow?</h2>
          <p className="text-xl text-blue-100 mb-10">Join thousands of companies using SahajCRM to manage their operations.</p>
          <Link 
            href="/register" 
            className="inline-flex px-10 py-5 font-black text-[#11253e] text-lg bg-[#f99d1c] hover:bg-[#e08b17] rounded-2xl shadow-2xl shadow-[#f99d1c]/20 transition-all hover:-translate-y-1 hover:scale-105"
          >
            Create Your Portal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#11253e] tracking-tight">SahajCRM<span className="text-[#f99d1c]">.</span></span>
          </div>
          <p className="text-gray-400 font-medium text-sm">Copyright 2026 SahajCRM. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-[#11253e]">Privacy</a>
            <a href="#" className="hover:text-[#11253e]">Terms</a>
            <a href="#" className="hover:text-[#11253e]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 hover:shadow-xl hover:shadow-gray-200/50 transition-all hover:-translate-y-1 group">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50/50 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#11253e] mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
