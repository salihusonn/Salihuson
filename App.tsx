import React, { useState } from 'react';
import StoryCreator from './components/StoryCreator';
import ChatAssistant from './components/ChatAssistant';
import ApiKeyGate from './components/ApiKeyGate';

enum Tab {
  Story = 'story',
  Chat = 'chat'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Story);

  return (
    <ApiKeyGate>
      <div className="min-h-screen bg-yellow-50 font-[Fredoka]">
        <nav className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <span className="text-2xl font-black text-orange-500 tracking-tight">StoryTime Magic</span>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab(Tab.Story)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  activeTab === Tab.Story 
                    ? 'bg-orange-400 text-white shadow-md' 
                    : 'text-gray-500 hover:text-orange-400'
                }`}
              >
                Story Mode
              </button>
              <button
                onClick={() => setActiveTab(Tab.Chat)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  activeTab === Tab.Chat 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-green-500'
                }`}
              >
                Chat Bot
              </button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-6">
          {activeTab === Tab.Story ? <StoryCreator /> : <ChatAssistant />}
        </main>
      </div>
    </ApiKeyGate>
  );
};

export default App;
