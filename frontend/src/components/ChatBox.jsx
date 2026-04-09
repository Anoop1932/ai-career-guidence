import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import SummaryCard from './SummaryCard';
import { Send, Sparkles } from 'lucide-react';

const ChatBox = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionState, setSessionState] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting ping to backend
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://ai-career-guidence-r85x.onrender.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: '', session_id: '123', state: {} })
        });
        const data = await response.json();
        setMessages([{ role: 'ai', content: data.reply }]);
        setSessionState(data.new_state);
      } catch (err) {
        console.error("Backend not reachable. Start the FastAPI server.");
        setMessages([{ role: 'ai', content: "Backend is not reachable. Please make sure FastAPI is running on port 8000." }]);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://ai-career-guidence-r85x.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: '123',
          state: sessionState
        })
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      }

      setSessionState(data.new_state);

      if (data.is_complete) {
        setIsComplete(true);
        // We will parse the final recommendation format using regex or from state if backend formats it 
        // In our backend, AI formats it as Markdown, but state has recommended_career.
        // For a beautiful UI, we might ideally get structured JSON from backend. 
        // For now we'll just show the message and partial card.
        if (data.new_state.recommended_career) {
          setRecommendationData({
            recommended_career: data.new_state.recommended_career
          });
        }
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to the server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl overflow-hidden relative">

      {/* Header */}
      <div className="bg-white/80 p-4 border-b border-blue-100 flex items-center shadow-sm z-10 backdrop-blur-lg">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white mr-4 shadow-lg shadow-blue-500/30">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            CareerGenius AI
          </h1>
          <p className="text-sm text-slate-500 font-medium">Your personalized career roadmap</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-slate-50/50">
        <div className="text-center text-xs text-slate-400 my-4 font-medium uppercase tracking-widest">Today</div>

        {messages.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}

        {isLoading && <ChatMessage role="ai" isTyping={true} />}

        {isComplete && recommendationData && (
          <SummaryCard data={recommendationData} />
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-blue-50 z-10">
        <form
          onSubmit={handleSend}
          className="max-w-4xl mx-auto relative flex items-center bg-slate-50 border border-slate-200 rounded-full focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-inner"
        >
          <input
            type="text"
            className="flex-1 bg-transparent border-none py-4 px-6 text-slate-700 placeholder-slate-400 focus:outline-none"
            placeholder={isComplete ? "Session complete! Thanks for chatting!" : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isComplete}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isComplete}
            className={`mr-2 p-3 rounded-full flex items-center justify-center transition-all ${!input.trim() || isLoading || isComplete
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95'
              }`}
          >
            <Send size={20} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
          </button>
        </form>
        <div className="text-center mt-3 text-xs text-slate-400">
          Powered by LangGraph & OpenAI
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
