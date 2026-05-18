'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';

const SUGGESTIONS = [
  "Summarize today's incidents",
  "What's the risk posture for Mumbai DC-2?",
  "Generate a weekly operations report",
  "Recommend actions to improve PUE",
];

const CANNED_RESPONSE = "AI Copilot is currently in preview mode. Full conversational intelligence will be available in the next release.";

export default function AICopilotPanel({ forceOpen, onOpenChange }) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = forceOpen ?? localOpen;
  const setOpen = (v) => { setLocalOpen(v); onOpenChange?.(v); };
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "I'm your AI operations assistant. I can help you investigate incidents, analyze trends, generate reports, and recommend actions. What would you like to explore?" },
  ]);
  const [typing, setTyping] = useState(false);
  const inputRef = useRef(null);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: CANNED_RESPONSE }]);
    }, 2000);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#00338D] shadow-lg shadow-[#00338D]/40 flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: open ? 'none' : 'flex' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-[#0077C8]/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <Sparkles size={20} />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col"
            style={{ height: '60vh', minHeight: '400px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#00338D] text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span className="font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K-Nexus AI Copilot</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4F6F9]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#00338D] text-white rounded-br-sm'
                      : 'bg-white border border-[#E2E8F0] text-[#1A1F36] rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E2E8F0] rounded-xl rounded-bl-sm px-3 py-2.5 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] typing-dot" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            <div className="px-3 py-2 bg-white border-t border-[#E2E8F0] flex gap-1.5 overflow-x-auto flex-shrink-0">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="flex-shrink-0 px-2.5 py-1 bg-[#F4F6F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-full text-[10px] text-[#6B7280] hover:text-[#1A1F36] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-[#E2E8F0] bg-white flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your infrastructure..."
                className="flex-1 text-xs text-[#1A1F36] placeholder:text-[#9CA3AF] bg-[#F4F6F9] border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#0077C8]/50 transition-colors"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg bg-[#00338D] hover:bg-[#0044b8] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
