'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatInterface.module.css';
import { Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm Wizardinho 🧙‍♂️. Ask me anything about Premier League stats, player injuries, or betting values!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) })
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
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
                        {msg.content}
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
                <button type="button" className={styles.sendButton} onClick={handleSubmit} disabled={loading}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
