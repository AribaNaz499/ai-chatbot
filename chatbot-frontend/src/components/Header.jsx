import React from 'react';
import robotImg from '../images/robot.png';
export default function Header({ onReset, onToggleSidebar }) {
  return (
    <header className="w-full bg-[#181c28] border-b border-gray-800 py-4.5 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-[#232938] transition text-xl focus:outline-none"
          title="Open Menu"
        >
          ☰
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">
            <img src={robotImg} alt="Cute Robot" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-semibold text-gray-100 text-sm sm:text-base">
            My  AI Chatbot
          </h1>
        </div>
      </div>

     <button
        onClick={onReset}
        className="text-gray-400 hover:text-emerald-400 p-2 rounded-lg hover:bg-[#232938] transition text-sm flex items-center gap-1.5 group"
        title="New Chat / Reset"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="2" 
          stroke="currentColor" 
          className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" 
          />
        </svg>
        <span className="hidden sm:inline">Reset</span>
      </button>
    </header>
  );
}