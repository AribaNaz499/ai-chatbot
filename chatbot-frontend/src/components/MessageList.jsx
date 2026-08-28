import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MessageList({ messages, loading, chatEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-2xl ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-br-none'
                : 'bg-[#1e2330] text-gray-200 rounded-bl-none border border-gray-700'
            }`}
          >
            {/* Conditional Markdown & Plain Text Rendering */}
            <div className="text-sm space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2">
              {msg.sender === 'bot' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-[#1e2330] p-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}