import React, { useEffect, useState } from 'react';

interface ApiKeyGateProps {
  children: React.ReactNode;
}

const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ children }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.error("Error checking API key:", e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        // Assume success if no error, as per instructions
        setHasKey(true);
      } catch (e) {
        console.error("Error selecting key", e);
        // If "Requested entity was not found", reset.
        if (e instanceof Error && e.message.includes("Requested entity was not found")) {
          setHasKey(false);
          alert("Key selection failed or expired. Please try again.");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="animate-bounce text-2xl font-bold text-orange-500">
          Loading StoryTime Magic...
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-4 font-[Fredoka]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-orange-200">
          <div className="mb-6 text-orange-400 text-6xl">
            <i className="fa-solid fa-key"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to StoryTime!</h1>
          <p className="text-gray-600 mb-8 text-lg">
            To generate magical stories and high-quality illustrations, we need to unlock the magic key.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-lock-open"></i>
            Unlock with API Key
          </button>
          
          <div className="mt-6 text-xs text-gray-400">
            <p>Requires a paid Google Cloud Project key for Veo/Imagen features.</p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-orange-400">
              Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ApiKeyGate;