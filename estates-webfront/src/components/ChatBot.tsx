"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
};

const QUICK_REPLIES = [
  "How does fractional investing work?",
  "What are the minimum investments?",
  "How do I earn returns?",
  "Is my investment safe?",
];

const BOT_RESPONSES: Record<string, string> = {
  "how does fractional investing work?":
    "Fractional investing lets you own a share of a premium property without buying the whole thing. You pool funds with other investors, and we handle everything — acquisition, management, and payouts. Your ownership is recorded and fully transparent.",
  "what are the minimum investments?":
    "You can start with as little as ₹10,000. Each property listing shows its minimum ticket size and expected yield so you can plan accordingly.",
  "how do i earn returns?":
    "You earn through two streams: monthly rental income distributed proportionally to your share, and capital appreciation when the property value rises. Both are tracked live on your dashboard.",
  "is my investment safe?":
    "All properties are legally vetted with clean titles before listing. Your ownership stake is documented via a registered trust structure. We also maintain a liquidity reserve so you can exit early if needed.",
};

function getBotReply(input: string): string {
  const key = input.toLowerCase().trim();
  for (const pattern of Object.keys(BOT_RESPONSES)) {
    if (key.includes(pattern.replace("?", "")) || key === pattern) {
      return BOT_RESPONSES[pattern];
    }
  }
  if (key.includes("return") || key.includes("yield") || key.includes("profit")) {
    return BOT_RESPONSES["how do i earn returns?"];
  }
  if (key.includes("safe") || key.includes("risk") || key.includes("secure")) {
    return BOT_RESPONSES["is my investment safe?"];
  }
  if (key.includes("minimum") || key.includes("how much") || key.includes("start")) {
    return BOT_RESPONSES["what are the minimum investments?"];
  }
  if (key.includes("fractional") || key.includes("work") || key.includes("how")) {
    return BOT_RESPONSES["how does fractional investing work?"];
  }
  return "Great question! Our team of property advisors can give you a detailed answer. Head to the Contact page or drop your email at invest@estates.in and we'll get back to you within 24 hours.";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "bot",
      text: "Hi! I'm your Estates advisor. Ask me anything about fractional real estate investing, returns, or how to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(text);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: reply },
      ]);
    }, 900);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") send(input);
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-neutral-950 shadow-[0_8px_32px_rgba(0,0,0,0.22)] flex items-center justify-center text-white transition-colors hover:bg-neutral-800"
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Unread dot when closed */}
      <AnimatePresence>
        {!open && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-[58px] right-5 z-[10000] w-3 h-3 rounded-full bg-[#ff5a36] border-2 border-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="fixed bottom-24 right-6 z-[9998] w-[360px] max-w-[calc(100vw-24px)] flex flex-col rounded-[28px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)] border border-neutral-100 bg-white"
            style={{ maxHeight: "min(600px, calc(100vh - 120px))" }}
          >
            {/* Header */}
            <div className="bg-neutral-950 px-5 py-4 flex items-center gap-3 flex-shrink-0">
              {/* Logo */}
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                  <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#A3A3A3" />
                  <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="white" />
                  <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#A3A3A3" />
                  <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="white" />
                  <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#A3A3A3" />
                  <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="white" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-sm leading-tight">Estates Advisor</span>
                <span className="text-neutral-400 text-[11px] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online now
                </span>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-bold text-[#ff5a36] bg-[#ff5a36]/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                  AI
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#f8f9fa]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-6 h-6 rounded-full bg-neutral-950 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                      <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="none">
                        <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#A3A3A3" />
                        <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="white" />
                        <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#A3A3A3" />
                        <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="white" />
                        <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#A3A3A3" />
                        <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="white" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed font-medium ${
                      msg.role === "user"
                        ? "bg-neutral-950 text-white rounded-[18px] rounded-tr-[6px]"
                        : "bg-white text-neutral-800 rounded-[18px] rounded-tl-[6px] shadow-sm border border-neutral-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-neutral-950 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="none">
                        <path d="M4,28V16a3,3 0 0 1 3-3v15Z" fill="#A3A3A3" />
                        <path d="M7,28V13a3,3 0 0 1 3 3v12Z" fill="white" />
                        <path d="M12,28V10a3,3 0 0 1 3-3v18Z" fill="#A3A3A3" />
                        <path d="M15,28V7a3,3 0 0 1 3 3v18Z" fill="white" />
                        <path d="M20,28V4a3,3 0 0 1 3-3v24Z" fill="#A3A3A3" />
                        <path d="M23,28V1a3,3 0 0 1 3 3v24Z" fill="white" />
                      </svg>
                    </div>
                    <div className="bg-white border border-neutral-100 shadow-sm rounded-[18px] rounded-tl-[6px] px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-neutral-400 block"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && (
              <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 bg-white border-t border-neutral-100 flex-shrink-0">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-700 hover:border-[#ff5a36] hover:text-[#ff5a36] transition-colors bg-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-neutral-100 flex items-center gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about properties, returns..."
                className="flex-1 text-[13px] font-medium text-neutral-800 placeholder-neutral-400 bg-neutral-50 rounded-full px-4 py-2.5 outline-none border border-neutral-200 focus:border-neutral-400 transition-colors"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                className="w-9 h-9 rounded-full bg-neutral-950 flex items-center justify-center text-white disabled:opacity-40 hover:bg-neutral-800 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Footer branding */}
            <div className="px-4 pb-3 bg-white text-center flex-shrink-0">
              <span className="text-[10px] text-neutral-400 font-medium">
                Powered by{" "}
                <span className="text-neutral-600 font-semibold">OD Creations</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
