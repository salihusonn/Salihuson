import React, { useState } from 'react';
import { generateStoryContent, generateIllustration, generateSpeech } from '../services/gemini';
import { Story, ImageSize } from '../types';
import AudioPlayer from './AudioPlayer';

const StoryCreator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.Size1K);
  
  // Audio state management per page
  const [pageAudio, setPageAudio] = useState<{ [key: number]: ArrayBuffer }>({});
  const [loadingAudio, setLoadingAudio] = useState<{ [key: number]: boolean }>({});

  const handleGenerateStory = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setLoadingStep('Writing your magical story...');
    setStory(null);
    setPageAudio({});

    try {
      const generatedStory = await generateStoryContent(topic);
      setStory(generatedStory);
      setLoadingStep('Drawing pictures...');
      
      // Auto-generate images for all pages
      const pagesWithImages = await Promise.all(
        generatedStory.pages.map(async (page, index) => {
          try {
            const imageUrl = await generateIllustration(page.imagePrompt, imageSize);
            return { ...page, imageUrl };
          } catch (e) {
            console.error(`Failed to generate image for page ${index}`, e);
            return page; // Return page without image on error
          }
        })
      );
      
      setStory({ ...generatedStory, pages: pagesWithImages });
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Oops! The magic wand sputtered. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleGenerateAudio = async (pageIndex: number, text: string) => {
    if (pageAudio[pageIndex]) return; // Already generated
    
    setLoadingAudio(prev => ({ ...prev, [pageIndex]: true }));
    try {
      const audioBuffer = await generateSpeech(text);
      setPageAudio(prev => ({ ...prev, [pageIndex]: audioBuffer }));
    } catch (error) {
      console.error("Error generating speech:", error);
      alert("Couldn't generate voice for this page.");
    } finally {
      setLoadingAudio(prev => ({ ...prev, [pageIndex]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Input Section */}
      {!story && !loading && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-yellow-200">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-blue-600 mb-2">Create a Story!</h2>
            <p className="text-gray-500 text-lg">What should your story be about?</p>
          </div>

          <div className="space-y-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., A space cat who loves pizza..."
              className="w-full text-2xl p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none bg-blue-50 text-gray-700 placeholder-blue-300 text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateStory()}
            />

            <div className="flex justify-center items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <label className="font-bold text-gray-600">Picture Quality:</label>
              <div className="flex gap-2">
                {Object.values(ImageSize).map((size) => (
                  <button
                    key={size}
                    onClick={() => setImageSize(size)}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                      imageSize === size 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-500 hover:bg-gray-100 border'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateStory}
              disabled={!topic.trim()}
              className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-3xl font-black rounded-2xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-3"></i>
              Make Magic!
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin text-6xl text-orange-400 mb-6">
            <i className="fa-solid fa-circle-notch"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-600 animate-pulse">{loadingStep}</h2>
          <p className="text-gray-400 mt-2">This might take a minute...</p>
        </div>
      )}

      {/* Story Display */}
      {story && !loading && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-black text-purple-600">{story.title}</h1>
            <button 
              onClick={() => setStory(null)} 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-gray-600 transition"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              New Story
            </button>
          </div>

          <div className="space-y-12">
            {story.pages.map((page, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-purple-100">
                <div className="md:flex">
                  {/* Image Section */}
                  <div className="md:w-1/2 bg-gray-100 min-h-[300px] relative">
                    {page.imageUrl ? (
                      <img 
                        src={page.imageUrl} 
                        alt={`Illustration for page ${index + 1}`}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                         <i className="fa-regular fa-image text-4xl"></i>
                         <p>No image generated</p>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                       <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                         Page {index + 1}
                       </span>
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="md:w-1/2 p-8 flex flex-col justify-center bg-yellow-50">
                    <p className="text-2xl text-gray-800 font-medium leading-relaxed font-[Fredoka] mb-6">
                      {page.text}
                    </p>
                    
                    <div className="mt-auto flex justify-end">
                      {loadingAudio[index] ? (
                         <div className="px-4 py-2 bg-gray-200 rounded-full flex items-center gap-2">
                           <i className="fa-solid fa-spinner fa-spin text-gray-600"></i>
                           <span className="text-sm font-bold text-gray-500">Loading Voice...</span>
                         </div>
                      ) : pageAudio[index] ? (
                        <AudioPlayer audioBuffer={pageAudio[index]} autoPlay={false} />
                      ) : (
                        <button
                          onClick={() => handleGenerateAudio(index, page.text)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full font-bold shadow-md transition-all transform hover:scale-105"
                        >
                          <i className="fa-solid fa-headphones"></i>
                          Read Aloud
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

           <div className="text-center py-10">
              <p className="text-2xl font-bold text-gray-400">The End</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoryCreator;
