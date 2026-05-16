

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, CheckCircle2, Edit3, Send, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* Background Glows (matching image) */}
      <div className="absolute top-0 left-[-20%] w-[800px] h-[800px] pointer-events-none opacity-20 [background:radial-gradient(circle,rgba(16,185,129,0.4)_0%,transparent_70%)]" />
      <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] pointer-events-none opacity-10 [background:radial-gradient(circle,rgba(59,130,246,0.3)_0%,transparent_70%)]" />

      {/* Hero Section */}
      <section className="relative z-10 flex w-full flex-col items-center justify-center px-4 text-center min-h-[calc(100vh-73px)] border-b border-white/5">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[64px] leading-[1.1] sm:leading-[1.1]"
        >
          Report Civic Issues in <br className="hidden sm:block" /> Real-Time<span className="text-primary">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-base md:text-lg text-muted-foreground/90 max-w-2xl leading-relaxed"
        >
          Helping communities grow stronger by making reporting simple, <br className="hidden sm:block" /> transparent, and effective.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Secure & Confidential</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Real-time Issue Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>Community Driven</span>
          </div>
        </motion.div>

        {/* Call to Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Button asChild size="lg" className="rounded-sm bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
            <Link to="/report">Report an Issue</Link>
          </Button>
        </motion.div>
      </section>

      {/* Four Step Process */}
      <section className="relative z-10 flex w-full flex-col items-center px-4 py-24 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-6xl text-center"
        >
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#00d27a] uppercase mb-3">HOW IT WORKS</h2>
          <h3 className="text-3xl font-bold mb-4">A Simple Four-Step Process</h3>
          <p className="text-muted-foreground mb-16">Report issues in your area and help your community become better.</p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              { icon: Edit3, num: "01", title: "Report an Issue", desc: "Submit civic issues with photos and location details." },
              { icon: Send, num: "02", title: "Submit", desc: "Our system validates and assigns the issue to the right authority." },
              { icon: Search, num: "03", title: "Track", desc: "Track the status of your issue in real-time." },
              { icon: Check, num: "04", title: "Resolved", desc: "Get notified when the issue is resolved." },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-start rounded-xl border border-white/[0.05] bg-[#0c0c0e] p-8 shadow-xl transition-colors hover:bg-[#111114]"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#00d27a]/10 text-[#00d27a]">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mb-2 text-sm font-bold text-[#00d27a]">{step.num}</div>
                <h4 className="mb-3 text-xl font-bold text-white">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
