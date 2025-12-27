'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolsUsed?: string[];
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Persistence: Load messages on mount
    useEffect(() => {
        const saved = localStorage.getItem('wizardinho-chat');
        if (saved) {
            try {
                // Parse dates back to objects if needed, but for display string is fine.
                // However, timestamp is typically Date. Let's just restore structure.
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        } else {
            setMessages([{
                id: '1',
                role: 'assistant',
                content: "Hello! I'm Wizardinho 🧙‍♂️. Ask me anything about Premier League stats, player injuries, or betting values!",
                timestamp: new Date()
            }]);
        }
    }, []);

    // Persistence: Save messages on update
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('wizardinho-chat', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                toolsUsed: data.toolsUsed,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "My crystal ball is foggy... (Error connecting to AI)",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messages}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.botMessage}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.75rem', opacity: 0.7 }}>
                            {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                            {msg.role === 'assistant' ? 'Wizardinho' : 'You'}
                        </div>
                        <div className={styles.markdownContent}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <div className={styles.tableWrapper}>
                                            <table {...props} />
                                        </div>
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a
                                            {...props}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#60a5fa', textDecoration: 'underline' }}
                                        />
                                    )
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {msg.toolsUsed.map((tool, i) => {
                                    const isSearch = tool === 'search_web';
                                    const badgeColor = isSearch ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)'; // Blue or Green
                                    const textColor = isSearch ? '#60a5fa' : '#4ade80';

                                    return (
                                        <span key={i} style={{
                                            fontSize: '0.7rem',
                                            backgroundColor: badgeColor,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            color: textColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {isSearch ? '🌍' : '⚡'} Used: {tool}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className={`${styles.message} ${styles.botMessage}`}>
                        <span className="animate-pulse">Analyzing stats...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    placeholder="Ask about team form, player stats, betting opportunities..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className={styles.sendButton} disabled={loading}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
