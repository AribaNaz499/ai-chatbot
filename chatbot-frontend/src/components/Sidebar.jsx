import React from 'react';
import { Trash2, MessageSquare } from 'lucide-react';
export default function Sidebar({
  isOpen,
  setIsOpen,
  chatHistory,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  activeChatId
}) {
  return (
    <>
      {/* Mobile Dark Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-[#181c28] border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-xl transition shadow-md"
          >
            <span>+</span> New Chat
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#232938] text-xl font-bold leading-none transition"
            title="Close Sidebar"
          >
            &times;
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-400 px-2 uppercase tracking-wider">
            Recent Chats
          </p>
          {chatHistory.length === 0 ? (
            <p className="text-sm text-gray-500 px-2 py-4">No past conversations</p>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat);
                  setIsOpen(false);
                }}
                className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer transition ${chat.id === activeChatId
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-medium'
                  : 'text-gray-300 hover:bg-[#232938] hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                  title="Delete chat"
                >
                  <div className="w-7 h-7 rounded-full bg-[#580e04] border border-red-500/50 flex items-center justify-center text-green-500 hover:text-green-700 hover:border-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}