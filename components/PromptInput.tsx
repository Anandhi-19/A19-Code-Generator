import React, { useState, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ImageIcon } from './icons/ImageIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { PdfIcon } from './icons/PdfIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  attachedFile: File | null;
  onRemoveAttachedFile: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, onFileChange, attachedFile, onRemoveAttachedFile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="p-4">
      {attachedFile && (
        <div className="mb-2 flex items-center justify-between text-sm bg-gray-700/50 px-3 py-1.5 rounded-lg">
          <span className="text-gray-300 truncate">{attachedFile.name}</span>
          <button onClick={onRemoveAttachedFile} className="ml-2 text-gray-400 hover:text-white" disabled={isLoading}>
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the website you want to create, or attach a file..."
          rows={4}
          className="w-full p-4 pr-28 text-base bg-panel-bg border border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-accent-purple focus:outline-none transition-all placeholder-gray-400"
          disabled={isLoading}
          aria-label="Website description prompt"
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Attach file"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
                {isMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                        <button onClick={() => {imageInputRef.current?.click(); setIsMenuOpen(false);}} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3">
                            <ImageIcon /> Upload Image
                        </button>
                        <button onClick={() => {textInputRef.current?.click(); setIsMenuOpen(false);}} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3">
                            <FileTextIcon /> Upload text file
                        </button>
                         <button onClick={() => { alert('PDF upload coming soon!'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 flex items-center gap-3 cursor-not-allowed">
                            <PdfIcon /> Upload PDF
                        </button>
                    </div>
                )}
            </div>
            <button
              onClick={onSubmit}
              disabled={isLoading || (!prompt.trim() && !attachedFile)}
              className="p-2 rounded-lg text-white bg-gradient-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-accent-blue"
              aria-label="Generate website"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <SendIcon className="w-6 h-6" />
              )}
            </button>
        </div>
        <input type="file" ref={imageInputRef} onChange={onFileChange} accept="image/*" className="hidden" />
        <input type="file" ref={textInputRef} onChange={onFileChange} accept=".txt" className="hidden" />
      </div>
    </div>
  );
};
