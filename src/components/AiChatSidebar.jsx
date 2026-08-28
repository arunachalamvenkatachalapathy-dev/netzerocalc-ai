import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendAgentChatMessage } from '../services/api.js';

export default function AiChatSidebar({ isOpen, onClose, activeProject, screenContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your NetZeroCalc AI Copilot. How can I help you analyze your carbon inventory or check CBAM compliance?',
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendAgentChatMessage(
        activeProject?.id || 'default_project',
        userMessage.content,
        messages.map(m => ({ role: m.role, content: m.content })),
        screenContext
      );

      setMessages([...newHistory, { 
        role: 'assistant', 
        content: response.answer,
        sources: response.sources || []
      }]);
    } catch (error) {
      setMessages([...newHistory, { 
        role: 'assistant', 
        content: `Error connecting to AI Copilot: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[540px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">AI Copilot</h2>
              <p className="text-[10px] text-slate-500 font-medium">Powered by Gemma 4 26B & Groq Fallback</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-sm' 
                  : 'bg-white border border-slate-200/90 text-slate-700 rounded-bl-none shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm prose-emerald max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 shadow-sm bg-white">
                            <table className="min-w-full divide-y divide-slate-200 text-xs text-left border-collapse" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-slate-100/90 font-bold text-slate-700 border-b border-slate-200" {...props} />,
                        th: ({node, ...props}) => <th className="px-3 py-2.5 font-bold text-slate-700 border-b border-slate-200 text-xs tracking-wider" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 text-slate-600 border-b border-slate-100 text-xs align-top whitespace-normal" {...props} />,
                        code: ({node, inline, ...props}) => (
                          inline 
                            ? <code className="bg-slate-100 text-emerald-700 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200" {...props} />
                            : <code className="font-mono text-xs" {...props} />
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Sources Tool Calls */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5 w-[92%]">
                  {msg.sources.map((source, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-md border border-slate-200">
                      <Info size={12} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-600">{source.tool_name}</span>
                        {source.tool_input && (
                          <span className="text-[9px] text-slate-500 font-mono break-all line-clamp-2">
                            {JSON.stringify(source.tool_input)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none shadow-sm px-4 py-3 flex items-center gap-2 text-sm">
                <Loader2 size={14} className="animate-spin text-emerald-500" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 relative"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the copilot..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-10"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-1.5 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[9px] text-slate-400 font-medium">AI can make mistakes. Verify important information.</span>
          </div>
        </div>
      </div>
    </>
  );
}
