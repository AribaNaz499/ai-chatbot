import React, { useRef } from 'react';
import { X, SendHorizontal } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  handleSend,
  selectedFile,
  setSelectedFile
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Raw File object send karein (App.jsx isko convert kar lega)
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Input clear karein
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="py-3">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 bg-[#1e2330] text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 w-fit">
          <span>📎 {selectedFile.name}</span>
          <button
            onClick={handleRemoveFile}
            className="text-gray-400 hover:text-red-400 p-0.5 rounded-full hover:bg-red-500/10 transition ml-1 shrink-0"
            type="button"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      )}

      <div className="flex items-center bg-[#181c28] border border-emerald-500/30 rounded-2xl p-2 shadow-lg focus-within:border-emerald-500 transition">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-emerald-400 transition rounded-xl"
          title="Attach Image or PDF"
        >
          📎
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything or upload image/PDF..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 px-3 placeholder-gray-500"
        />

        <button
          type="button"
          onClick={handleSend}
          className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 p-2.5 rounded-xl transition font-bold flex items-center justify-center shrink-0 shadow-md"
          title="Send message"
        >
          <SendHorizontal className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}