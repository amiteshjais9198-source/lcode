import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      parts: [{ text: `👋 Hi! I'm your AI coding assistant for **${problem?.title || 'this problem'}**.\n\nAsk me anything — hints, approach, time complexity, or debugging help!` }]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const onSubmit = async (data) => {
    const userMessage = data.message.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    reset();
    setIsTyping(true);

    try {
      const response = await axiosClient.post("/ai/chat", {
        message: userMessage,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startcode: problem.startcode,
      });

      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: response.data.message }]
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "⚠️ I'm having trouble connecting right now. Please try again in a moment." }]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">

      {/* Header */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">AI Assistant</p>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white ${
                isUser
                  ? 'bg-gradient-to-br from-blue-500 to-violet-600'
                  : 'bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-600'
              }`}>
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isUser
                  ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
              }`}>
                <div className={`prose prose-sm max-w-none break-words overflow-x-auto ${
                  isUser ? 'prose-invert' : 'prose-invert prose-pre:bg-slate-900 prose-code:text-emerald-400'
                }`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.parts[0].text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5">
            <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border border-slate-600 flex items-center justify-center text-white">
              <Bot size={14} />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="shrink-0 p-3 border-t border-slate-700 bg-slate-800/50"
      >
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-200">
          <input
            ref={inputRef}
            placeholder="Ask anything about this problem…"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            {...register("message", { required: true, minLength: 2 })}
          />
          <button
            type="submit"
            disabled={isTyping || !!errors.message}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200"
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-1.5">Press Enter to send · Shift+Enter for new line</p>
      </form>
    </div>
  );
}

export default ChatAi;