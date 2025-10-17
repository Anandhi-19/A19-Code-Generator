import React, { useState, useRef, useEffect } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { PromptInput } from './components/PromptInput';
import { PreviewPanel } from './components/PreviewPanel';
import { WebsiteCode, ai } from './services/geminiService';
import { A19Icon } from './components/icons/A19Icon';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Chat } from '@google/genai';
import { ChatMessage } from './types';
import { UserIcon } from './components/icons/UserIcon';
import { GeminiIcon } from './components/icons/GeminiIcon';
import { Type } from '@google/genai';

const systemInstruction = `You are an expert web developer AI...`; // keep your existing text here

function App() {
  // 👇 Added: Control for showing intro video first
  const [showWebsite, setShowWebsite] = useState(false);

  const [prompt, setPrompt] = useState<string>('');
  const [latestCode, setLatestCode] = useState<WebsiteCode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = document.getElementById("intro-video") as HTMLVideoElement;
    if (video) {
      video.onended = () => setShowWebsite(true);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAttachedFile(file);
    event.target.value = '';
  };

  const removeAttachedFile = () => setAttachedFile(null);

  const handleSubmit = async () => {
    if ((!prompt.trim() && !attachedFile) || isLoading) return;

    setIsLoading(true);
    setError(null);

    let userText = prompt;
    if (attachedFile && attachedFile.type === 'text/plain') {
      userText += `\n\n--- Content from attached file ${attachedFile.name} ---\n${await attachedFile.text()}`;
    }

    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setPrompt('');

    try {
      let currentChat = chatSession;
      if (!currentChat) {
        const newChat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                html: { type: Type.STRING },
                css: { type: Type.STRING },
                javascript: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["html", "css", "javascript", "explanation"],
            },
          },
        });
        currentChat = newChat;
        setChatSession(newChat);
      }

      const parts: any[] = [{ text: userText }];
      if (attachedFile && attachedFile.type.startsWith('image/')) {
        const base64Data = await fileToBase64(attachedFile);
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: attachedFile.type
          }
        });
      }
      removeAttachedFile();

      const response = await currentChat.sendMessage({ message: parts });
      const responseText = response.text;

      if (!responseText) throw new Error("API returned an empty response.");

      const parsedResponse: WebsiteCode = JSON.parse(responseText);
      if (parsedResponse.html && parsedResponse.css) setLatestCode(parsedResponse);

      setChatHistory(prev => [...prev, { role: 'model', text: parsedResponse.explanation }]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const showWelcome = chatHistory.length === 0 && !isLoading && !error;

  // 👇 Add this block to handle video intro
  if (!showWebsite) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <video
          id="intro-video"
          src="/A3.mp4"
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 👇 After video ends, show the full website
  return (
    <div className="text-white min-h-screen flex flex-col font-sans">
      <header className="p-4 border-b border-gray-700 flex items-center">
        <A19Icon className="w-12 h-12 mr-3" />
        <h1 className="text-xl font-semibold">A19 Code Generator</h1>
      </header>

      <main className="flex-grow flex flex-col overflow-hidden">
        {error && !showWelcome && (
          <div className="bg-red-900 text-red-200 p-2 m-4 rounded-lg text-sm">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        <div className="flex-grow flex p-4 gap-4 overflow-hidden">
          {showWelcome ? (
            <div className="w-full">
              <WelcomePage setPrompt={setPrompt} />
            </div>
          ) : (
            <>
              <div className="w-1/3 bg-panel-bg rounded-xl flex flex-col border border-gray-700 overflow-hidden">
                <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-6">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'model' && <GeminiIcon className="w-7 h-7 flex-shrink-0 mt-1" />}
                      <div className={`p-3 rounded-lg max-w-[85%] break-words ${msg.role === 'user' ? 'bg-accent-blue text-white' : 'bg-gray-800/60'}`}>
                        {msg.role === 'user'
                          ? <p className="whitespace-pre-wrap">{msg.text}</p>
                          : <MarkdownRenderer content={msg.text} />}
                      </div>
                      {msg.role === 'user' && <UserIcon className="w-7 h-7 flex-shrink-0 mt-1" />}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <GeminiIcon className="w-7 h-7 flex-shrink-0 mt-1 animate-pulse-light" />
                      <div className="p-3 rounded-lg bg-gray-800/60 flex items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce ml-2" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce ml-2" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700">
                  <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onFileChange={handleFileChange}
                    attachedFile={attachedFile}
                    onRemoveAttachedFile={removeAttachedFile}
                  />
                </div>
              </div>

              <div className="w-2/3">
                <PreviewPanel code={latestCode} isLoading={isLoading && !latestCode} />
              </div>
            </>
          )}
        </div>
      </main>

      {showWelcome && (
        <footer className="border-t border-gray-700">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onFileChange={handleFileChange}
            attachedFile={attachedFile}
            onRemoveAttachedFile={removeAttachedFile}
          />
        </footer>
      )}
    </div>
  );
}

export default App;
