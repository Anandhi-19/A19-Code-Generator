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
import { VideoSplashScreen } from './components/VideoSplashScreen';

const systemInstruction = `You are an expert web developer AI. Your primary task is to generate complete, single-page websites based on user descriptions. You will then engage in a conversation to refine the website, make changes, or answer questions about the code.

**Initial Request:**
When the user first describes a website, you MUST respond with a JSON object containing the complete \`html\`, \`css\`, \`javascript\`, and an \`explanation\`. The code should be self-contained (e.g., use inline SVGs, no external asset links). The \`html\`, \`css\`, and \`javascript\` code you generate MUST be well-formatted with proper indentation and newlines. Do not return minified or single-line code. The \`explanation\` should be a point-wise summary of the created website using markdown.

**Follow-up Requests:**
- If the user asks for a change, you MUST regenerate the *entire, complete* code with the change implemented. Provide a new \`explanation\` detailing what you updated.
- If the user asks a question about the code or web development, answer it conversationally in the \`explanation\` field and return the *previous, unchanged* code in the \`html\`, \`css\`, and \`javascript\` fields.

**Response Format:**
ALWAYS respond with a valid JSON object with this exact structure, without any markdown formatting like \`\`\`json:
{
  "html": "...",
  "css": "...",
  "javascript": "...",
  "explanation": "..."
}`;

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [latestCode, setLatestCode] = useState<WebsiteCode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  
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
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
    event.target.value = '';
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
  };

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
                systemInstruction: systemInstruction,
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
      
      if (!responseText) {
        throw new Error("API returned an empty response.");
      }

      const parsedResponse: WebsiteCode = JSON.parse(responseText);
      
      if (parsedResponse.html && parsedResponse.css) {
          setLatestCode(parsedResponse);
      }
      
      setChatHistory(prev => [...prev, { role: 'model', text: parsedResponse.explanation }]);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVideoFinished) {
    return <VideoSplashScreen onVideoEnd={() => setIsVideoFinished(true)} />;
  }

  const showWelcome = chatHistory.length === 0 && !isLoading && !error;

  return (
    <div className="text-white min-h-screen flex flex-col font-sans">
      <header className="p-4 border-b border-gray-700 flex items-center">
        <A19Icon className="w-8 h-8 mr-3" />
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
                               {msg.role === 'user' ? <p className="whitespace-pre-wrap">{msg.text}</p> : <MarkdownRenderer content={msg.text} />}
                           </div>
                           {msg.role === 'user' && <UserIcon className="w-7 h-7 flex-shrink-0 mt-1" />}
                       </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <GeminiIcon className="w-7 h-7 flex-shrink-0 mt-1 animate-pulse-light" />
                            <div className="p-3 rounded-lg bg-gray-800/60 flex items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce " style={{animationDelay: '0s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce ml-2" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce ml-2" style={{animationDelay: '0.4s'}}></div>
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