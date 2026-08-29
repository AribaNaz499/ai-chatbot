import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageList from './components/MessageList';
import SuggestionChips from './components/SuggestionChips';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentChatId, setCurrentChatId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello Ariba! I am your AI Assistant. How can I help you today?'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // File ko Base64 string mein convert karne ke liye helper function
 // Updated Helper Function
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Direct file target handle karne ke liye (agar input event pass ho gaya ho)
      const actualFile = file?.target?.files?.[0] || file?.file || file;

      if (!(actualFile instanceof Blob)) {
        return reject(new TypeError("Selected object is not a valid File or Blob"));
      }

      const reader = new FileReader();
      reader.readAsDataURL(actualFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;

    let filePayload = null;

    if (selectedFile) {
      try {
        const base64Data = await fileToBase64(selectedFile);
        filePayload = {
          name: selectedFile.name,
          mimeType: selectedFile.type,
          base64: base64Data
        };
      } catch (err) {
        console.error('File reading failed:', err);
        return;
      }
    }

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input || (selectedFile ? `Uploaded file: ${selectedFile.name}` : ''),
      fileName: selectedFile ? selectedFile.name : null
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const currentInput = input;

    setInput('');
    setSelectedFile(null);
    setLoading(true);

    let activeId = currentChatId;
    if (!activeId) {
      activeId = Date.now();
      setCurrentChatId(activeId);

      const newSession = {
        id: activeId,
        title: currentInput.substring(0, 20) || filePayload?.name || 'New Chat',
        messages: newMessages
      };

      setChatHistory((prev) => [newSession, ...prev]);
    } else {
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === activeId ? { ...chat, messages: newMessages } : chat
        )
      );
    }

    try {
      // Dynamic URL: Local test ke liye localhost, varna Vercel URL
      const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/chat'
        : 'https://chatbot-backend-eight-omega.vercel.app/api/chat';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.filter((m) => m.id !== 1),
          file: filePayload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      if (data.reply) {
        const botMsg = { id: Date.now() + 1, sender: 'bot', text: data.reply };
        const updatedMessages = [...newMessages, botMsg];

        setMessages(updatedMessages);

        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === activeId ? { ...chat, messages: updatedMessages } : chat
          )
        );
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Server error. Kindly check your backend.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Hello Ariba! I am your AI Assistant. How can I help you today?'
      }
    ]);
  };

  const handleSelectChat = (session) => {
    setCurrentChatId(session.id);
    setMessages(session.messages);
  };

  const handleDeleteChat = (idToDelete) => {
    const updatedHistory = chatHistory.filter((chat) => chat.id !== idToDelete);
    setChatHistory(updatedHistory);

    if (currentChatId === idToDelete) {
      handleNewChat();
    }
  };

  return (
    <div className="w-screen h-screen bg-[#121520] text-gray-100 flex overflow-hidden font-sans">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        activeChatId={currentChatId}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          onReset={handleNewChat} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        <div className="flex-1 flex flex-col w-full max-w-[94%] mx-auto px-2 sm:px-4 overflow-hidden">
          <MessageList messages={messages} loading={loading} chatEndRef={chatEndRef} />
          <SuggestionChips onSelectChip={(text) => setInput(text)} />
          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </div>
    </div>
  );
}