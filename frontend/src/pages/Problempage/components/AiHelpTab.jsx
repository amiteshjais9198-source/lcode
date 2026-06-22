import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import axiosClient from '../../../utilis/axiosClient';
import ReactMarkdown from 'react-markdown';

export default function AiHelpTab({ problemTitle, selectedLang, currentCode }) {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi there! I am your AI coding assistant. Stuck on this problem? Ask me anything!' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];

        // Add user message to UI immediately
        setMessages(newMessages);
        setInput('');

        try {
            // Call our new backend route
            const res = await axiosClient.post('/ai/chat', {
                messages: newMessages,
                code: currentCode,
                problemTitle: problemTitle,  //ye saare baap index.jsx of problem page se aa rha hai 
                language: selectedLang
            });

            if (res.data?.success) {
                setMessages(prev => [...prev, res.data.data]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: 'Oops! Something went wrong.' }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Network Error: Could not reach the AI.' }]);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--problem-bg)' }}>

            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--tc-border, rgba(100,110,140,0.18))', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(0,184,163,0.15)', padding: 8, borderRadius: 8 }}>
                    <Sparkles size={18} color="#00b8a3" />
                </div>
                <div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>AI Assistant</h3>
                    <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>Powered by Gemini</p>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                        gap: 12,
                        alignItems: 'flex-start'
                    }}>
                        {msg.role === 'ai' && (
                            <div style={{ background: '#00b8a3', borderRadius: '50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={14} color="#fff" />
                            </div>
                        )}
                        <div style={{
                            background: msg.role === 'user' ? 'rgba(0,184,163,0.12)' : 'rgba(100,110,140,0.08)',
                            border: msg.role === 'user' ? '1px solid rgba(0,184,163,0.2)' : '1px solid var(--tc-border, rgba(100,110,140,0.18))',
                            padding: '12px 16px',
                            borderRadius: 12,
                            borderTopRightRadius: msg.role === 'user' ? 2 : 12,
                            borderTopLeftRadius: msg.role === 'ai' ? 2 : 12,
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            maxWidth: '85%',
                            overflowX: 'auto'
                        }}>
                            <ReactMarkdown
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                        return !inline ? (
                                            <div style={{ background: '#1e1e1e', padding: '12px', borderRadius: '8px', overflowX: 'auto', margin: '8px 0', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '13px' }}>
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        ) : (
                                            <code style={{ background: 'rgba(100,110,140,0.2)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--tc-border, rgba(100,110,140,0.18))' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for hints, code explanation, or debugging..."
                        style={{
                            flex: 1,
                            background: 'rgba(100,110,140,0.06)',
                            border: '1px solid var(--tc-border, rgba(100,110,140,0.2))',
                            borderRadius: 8,
                            padding: '10px 14px',
                            fontSize: 13,
                            color: 'inherit',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{
                            background: input.trim() ? '#00b8a3' : 'rgba(100,110,140,0.2)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '0 16px',
                            cursor: input.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
