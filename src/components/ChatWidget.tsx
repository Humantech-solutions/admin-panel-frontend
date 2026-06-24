"use client";

import { useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Loader2, CheckCircle2, Bot } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";

type Step = "greeting" | "form" | "done";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("greeting");
  const [userMessage, setUserMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", query: "" });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          query: formData.query || userMessage,
          pageUrl: window.location.href,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setStep("done");
      } else {
        toast.error("Failed to send your message. Please try again.");
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("greeting");
      setUserMessage("");
      setFormData({ email: "", phone: "", query: "" });
    }, 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] bg-white rounded-2xl shadow-2xl shadow-[#11253e]/20 border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#11253e] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#f99d1c] rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Nabhira Support</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/60 text-[10px]">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto bg-gray-50/80">
              {/* STEP 1: Greeting + user message input */}

              {/* Bot greeting — always visible */}
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-6 h-6 bg-[#f99d1c] rounded-full flex items-center justify-center shrink-0 mb-0.5">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <p className="text-[#11253e] text-sm font-light leading-relaxed">
                    <span className="font-semibold">Hello! Welcome to Nabhira.</span>
                    <br />
                    How can we help you today?
                  </p>
                </div>
              </div>

              {/* User message bubble — shown after they send */}
              <AnimatePresence>
                {(step === "form" || step === "done") && userMessage && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="bg-[#11253e] text-white text-sm font-light px-4 py-3 rounded-2xl rounded-tr-sm max-w-[75%] shadow-sm">
                      {userMessage}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* Bot auto-reply — shown after user sends */}
              <AnimatePresence>
                {(step === "form" || step === "done") && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-end gap-2 max-w-[85%]"
                  >
                    <div className="w-6 h-6 bg-[#f99d1c] rounded-full flex items-center justify-center shrink-0 mb-0.5">
                      <Bot size={12} className="text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                      <p className="text-[#11253e] text-sm font-light leading-relaxed">
                        Thank you for reaching out. One of our solution experts will be with you shortly.
                        <br /><br />
                        Please enter your details below:
                      </p>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* STEP 2: Details form */}
              <AnimatePresence>
                {step === "form" && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 space-y-3"
                  >
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm text-[#11253e] rounded-xl focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/10 transition-all placeholder-gray-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Phone <span className="text-gray-300 normal-case font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm text-[#11253e] rounded-xl focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/10 transition-all placeholder-gray-300"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                          Additional Details <span className="text-gray-300 normal-case font-normal">(optional)</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Any additional context..."
                          value={formData.query}
                          onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm text-[#11253e] rounded-xl focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/10 transition-all placeholder-gray-300 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#11253e] hover:bg-[#1a3a60] text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-[11px] uppercase tracking-widest disabled:opacity-60 active:scale-[0.98]"
                      >
                        {isSubmitting ? (
                          <><Loader2 size={14} className="animate-spin" /> Sending...</>
                        ) : (
                          <><Send size={14} /> Submit Details</>
                        )}
                      </button>
                    </form>
                  </Motion.div>
                )}
              </AnimatePresence>

              {/* STEP 3: Done */}
              <AnimatePresence>
                {step === "done" && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 text-center space-y-4"
                  >
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} className="text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-[#11253e]">Message Received!</p>
                      <p className="text-gray-400 text-sm font-light mt-1 leading-relaxed">
                        Our team will get back to you shortly.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-[#f99d1c] text-xs font-bold uppercase tracking-widest hover:underline"
                    >
                      Close
                    </button>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 1: Message input bar (only on greeting step) */}
            {step === "greeting" && (
              <form
                onSubmit={handleSendMessage}
                className="px-4 pb-4 pt-1 flex gap-2 border-t border-gray-50"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm text-[#11253e] rounded-xl focus:outline-none focus:border-[#f99d1c] focus:ring-2 focus:ring-[#f99d1c]/10 transition-all placeholder-gray-300"
                />
                <button
                  type="submit"
                  disabled={!userMessage.trim()}
                  className="w-10 h-10 bg-[#11253e] hover:bg-[#1a3a60] text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
                >
                  <Send size={15} />
                </button>
              </form>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <Motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 bg-[#11253e] hover:bg-[#1a3a60] text-white rounded-full shadow-xl shadow-[#11253e]/30 flex items-center justify-center transition-colors relative"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <Motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </Motion.div>
          ) : (
            <Motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </Motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#f99d1c] rounded-full border-2 border-white" />
        )}
      </Motion.button>
    </div>
  );
}
