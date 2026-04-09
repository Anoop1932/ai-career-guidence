import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ role, content, isTyping }) => {
  const isAI = role === 'ai';

  if (isTyping) {
    return (
      <div className="flex w-full mt-4 space-x-3 max-w-xs animate-fade-in-up">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot size={20} className="text-blue-600" />
        </div>
        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2 items-center">
          <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-2xl ${isAI ? 'self-start' : 'self-end ml-auto justify-end'}`}>
      {isAI && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
          <Bot size={20} className="text-blue-600" />
        </div>
      )}
      
      <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base ${
        isAI 
          ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
          : 'bg-blue-600 text-white rounded-tr-none'
      }`}>
         <div className="whitespace-pre-wrap">{content}</div>
      </div>
      
      {!isAI && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center shadow-sm">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
