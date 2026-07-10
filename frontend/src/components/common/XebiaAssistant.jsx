import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Brain, Award, GraduationCap, ChevronRight } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useAuth } from '@/hooks/useAuth';

export default function XebiaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hi there! I am your Xebia AI Assistant. How can I help you with your learning journey today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const { courses, categories, students } = useCatalog();
  const { user } = useAuth();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let responseText = '';
      const lowercaseQuery = query.toLowerCase();

      if (lowercaseQuery.includes('progress') || lowercaseQuery.includes('status')) {
        responseText = `You are doing great! The platform is currently tracking ${courses?.length || 12} enterprise courses across ${categories?.length || 4} technical pillars. The average learner study hours are currently at 45.8 hours per quarter, with a 94.2% completion rate.`;
      } else if (lowercaseQuery.includes('recommend') || lowercaseQuery.includes('course') || lowercaseQuery.includes('suggest')) {
        const topCourses = courses?.slice(0, 3) || [];
        if (topCourses.length > 0) {
          responseText = `Based on current transformation goals, I highly recommend: \n\n` + 
            topCourses.map((c, i) => `${i + 1}. **${c.title}** (${c.difficulty || 'Intermediate'})`).join('\n') + 
            `\n\nWould you like me to open the course builder or dashboard details for any of these?`;
        } else {
          responseText = `I recommend taking our flagship **Generative AI & LLM Engineering** and **Cloud Engineering & DevOps Mastery** courses. They are highly active this month!`;
        }
      } else if (lowercaseQuery.includes('ai') || lowercaseQuery.includes('readiness') || lowercaseQuery.includes('index')) {
        responseText = `The **AI Readiness Index** is currently at **88%**! This represents the percentage of technical teams who have completed AI transformation cohorts and are actively using tools like GitHub Copilot in their client deliveries.`;
      } else if (lowercaseQuery.includes('hello') || lowercaseQuery.includes('hi') || lowercaseQuery.includes('hey')) {
        responseText = `Hello! Hope you are having a productive day at Xebia. How can I assist you with categories, courses, or learning analytics?`;
      } else if (lowercaseQuery.includes('fresher') || lowercaseQuery.includes('campus')) {
        responseText = `Our **Campus-to-Deployment Funnel** is currently tracking freshers. The current training completion rate is **98.2%**, with a **95%** project deployment rate. Average time to deploy is 42 days.`;
      } else {
        responseText = `I'm on it! As your Xebia Learning Companion, I can help you search courses, analyze learning metrics, inspect certification status, and check AI indices. Try clicking one of the quick prompt buttons below!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const prompts = [
    { label: '📊 Summarize progress', query: 'Tell me about platform progress and stats' },
    { label: '🚀 Recommend courses', query: 'Recommend some top courses' },
    { label: '🤖 What is AI Readiness?', query: 'What is the AI Readiness Index?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="mb-4 flex h-[480px] w-[350px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E0F14]/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/[0.05]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#831B84] to-[#FF6200] px-4 py-3.5 text-white">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Brain className="h-5 w-5 text-white" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#831B84] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-none">Xebia AI Assistant</h4>
                  <span className="text-[9px] text-purple-200 font-semibold mt-1 inline-block">Online · Assistant</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer transition-colors border-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#FF6200] text-white rounded-tr-none'
                        : 'bg-white/[0.04] text-slate-200 border border-white/[0.06] rounded-tl-none'
                    }`}
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-none bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-xs text-slate-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Prompts suggestions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-white/[0.04] bg-white/[0.01] space-y-1.5">
                <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Common Questions</p>
                <div className="flex flex-col gap-1.5">
                  {prompts.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSend(p.query)}
                      className="text-left w-full px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-[#FF6200]/10 hover:border-[#FF6200]/30 text-[11px] text-slate-300 font-semibold transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span>{p.label}</span>
                      <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-purple-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2 border-t border-white/[0.06] bg-[#0E0F14]/90 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Xebia Assistant..."
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF6200] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer border-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#831B84] to-[#FF6200] text-white shadow-2xl hover:opacity-95 cursor-pointer relative border-0"
      >
        <MessageSquare className="h-5.5 w-5.5" />
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 border border-white" />
        </span>
      </motion.button>
    </div>
  );
}
