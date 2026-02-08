'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/contexts/DashboardContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function GeminiChat() {
  const { address } = useAccount();
  const { dashboardData, refetchDashboard } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableCredits = dashboardData?.[4] || BigInt(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !address) return;

    if (availableCredits < BigInt(1)) {
      setError('Insufficient credits! Please deposit more USDC.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setError('');

    try {
      // Build history in Gemini format (exclude current message)
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          history,
          userAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, modelMessage]);
      refetchDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      // Remove the user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const samplePrompts = [
    "Explain how DeFi yield farming works",
    "What are the risks of lending protocols?",
    "How does Aave calculate interest rates?",
    "What is impermanent loss in liquidity pools?",
  ];

  return (
    <div className="elevated-card rounded-2xl p-6 h-full flex flex-col" style={{ minHeight: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4285f4] to-[#00d4aa] flex items-center justify-center">
            <span className="text-lg">◐</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Gemini Chat</h2>
            <p className="text-xs text-[#52525b]">Powered by Google Gemini 2.0 Flash</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(66,133,244,0.1)] border border-[rgba(66,133,244,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#4285f4] animate-pulse" />
          <span className="text-sm font-medium text-[#4285f4]">
            {availableCredits?.toString() || '0'} credits
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4" style={{ maxHeight: '500px' }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[rgba(66,133,244,0.1)] flex items-center justify-center">
              <span className="text-4xl opacity-70">◐</span>
            </div>
            <p className="text-[#52525b] mb-1">Start a conversation</p>
            <p className="text-sm text-[#52525b] mb-6">Ask Gemini anything — each message costs 1 credit</p>
            <div>
              <p className="text-xs text-[#52525b] mb-2 text-center">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]
                               text-[#a1a1aa] hover:text-[#fafafa] border border-[rgba(255,255,255,0.05)]
                               hover:border-[rgba(66,133,244,0.3)] transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#4285f4] to-[#00d4aa] text-[#0a0a0f]'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#fafafa]'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-[rgba(0,0,0,0.5)]' : 'text-[#52525b]'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4285f4] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#4285f4] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#4285f4] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] mb-4">
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3">
        <textarea
          placeholder="Ask Gemini anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-field flex-1 resize-none h-14 py-4"
          disabled={isSending}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending || availableCredits < BigInt(1)}
          className="btn-primary px-6 flex items-center gap-2 self-end h-14"
          style={{ background: !input.trim() || isSending || availableCredits < BigInt(1) ? undefined : 'linear-gradient(135deg, #4285f4, #00d4aa)' }}
        >
          {isSending ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-[#52525b] mt-2 text-center">Press Enter to send • Shift+Enter for new line • 1 credit per message</p>
    </div>
  );
}
