import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WebsiteCode } from '../services/geminiService';
import { PreviewIcon } from './icons/PreviewIcon';
import { HtmlIcon } from './icons/HtmlIcon';
import { CssIcon } from './icons/CssIcon';
import { JsIcon } from './icons/JsIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { FullscreenIcon } from './icons/FullscreenIcon';
import { DeviceIcon } from './icons/DeviceIcon';
import { DesktopIcon } from './icons/DesktopIcon';
import { TabletIcon } from './icons/TabletIcon';
import { MobileIcon } from './icons/MobileIcon';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

interface PreviewPanelProps {
  code: WebsiteCode | null;
  isLoading: boolean;
}

type Tab = 'preview' | 'html' | 'css' | 'javascript';
type DeviceSize = 'desktop' | 'tablet' | 'mobile';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, isLoading }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [showCopied, setShowCopied] = useState(false);
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const deviceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(event.target as Node)) {
        setIsDeviceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'preview' && code) {
      const timer = setTimeout(() => Prism.highlightAll(), 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, code]);
  
  const srcDoc = useMemo(() => {
    if (!code) return '';
    return `
      <html>
        <head>
          <style>${code.css}</style>
        </head>
        <body>
          ${code.html}
          <script>${code.javascript}</script>
        </body>
      </html>
    `;
  }, [code]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };
  
  const handleDownload = () => {
    if (!code) return;
    const zip = new JSZip();
    zip.file("index.html", code.html);
    zip.file("style.css", code.css);
    zip.file("script.js", code.javascript);
    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "website.zip");
    });
  };
  
  const openFullscreen = () => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.requestFullscreen) {
        iframe.requestFullscreen();
    }
  };

  const deviceDimensions = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!code) {
      return (
        <div className="flex items-center justify-center h-full text-center p-4">
          <p className="text-gray-400">Enter a description below to generate a website and see the preview and code here.</p>
        </div>
      );
    }
    
    const codeContent = {
        html: code.html,
        css: code.css,
        javascript: code.javascript
    };

    if (activeTab === 'preview') {
      return (
         <div className="w-full h-full flex items-center justify-center p-4 bg-gray-800/50 overflow-auto">
            <iframe
                id="preview-iframe"
                srcDoc={srcDoc}
                title="Website Preview"
                className="bg-white rounded-md shadow-lg transition-all duration-300 ease-in-out flex-shrink-0"
                style={deviceDimensions[deviceSize]}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
      );
    } else {
      const content = codeContent[activeTab as keyof typeof codeContent] || '';
      const language = activeTab === 'javascript' ? 'js' : activeTab;
      return (
        <div className="relative h-full text-sm">
            <pre className="h-full w-full overflow-auto p-4 bg-gray-900/50 !text-sm"><code className={`language-${language}`}>{content}</code></pre>
            <button 
                onClick={() => handleCopy(content)}
                className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                title="Copy code"
            >
                {showCopied ? 'Copied!' : <CopyIcon />}
            </button>
        </div>
      );
    }
  };
  
  const TabButton: React.FC<{tabName: Tab, icon: React.ReactNode, label: string}> = ({ tabName, icon, label }) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        activeTab === tabName ? 'bg-panel-bg text-white' : 'text-gray-400 hover:bg-gray-800'
        }`}
    >
        {icon}
        {label}
    </button>
  );

  return (
    <div className="bg-panel-bg rounded-xl flex flex-col h-full border border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center px-2 border-b border-gray-700 bg-gray-900/50">
        <div className="flex">
            <TabButton tabName="preview" icon={<PreviewIcon />} label="Preview" />
            <TabButton tabName="html" icon={<HtmlIcon />} label="HTML" />
            <TabButton tabName="css" icon={<CssIcon />} label="CSS" />
            <TabButton tabName="javascript" icon={<JsIcon />} label="JavaScript" />
        </div>
        <div className="flex items-center gap-2 pr-2">
            {activeTab === 'preview' && code && (
                <button onClick={openFullscreen} className="p-2 text-gray-400 hover:text-white" title="Fullscreen Preview"><FullscreenIcon className="w-5 h-5" /></button>
            )}
            {code && (
                <button onClick={handleDownload} className="p-2 text-gray-400 hover:text-white" title="Download as .zip"><DownloadIcon className="w-5 h-5" /></button>
            )}
            {activeTab === 'preview' && code && (
                <div className="relative" ref={deviceMenuRef}>
                    <button 
                        onClick={() => setIsDeviceMenuOpen(prev => !prev)}
                        className="p-2 text-gray-400 hover:text-white" title="Change device preview">
                        <DeviceIcon className="w-5 h-5" />
                    </button>
                    {isDeviceMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                            <button onClick={() => { setDeviceSize('desktop'); setIsDeviceMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3">
                                <DesktopIcon className="w-5 h-5" />
                                Current screen size
                            </button>
                             <button onClick={() => { setDeviceSize('tablet'); setIsDeviceMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3">
                                <TabletIcon className="w-5 h-5" />
                                Tablet
                            </button>
                            <button onClick={() => { setDeviceSize('mobile'); setIsDeviceMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3">
                                <MobileIcon className="w-5 h-5" />
                                Mobile
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
      <div className="flex-grow relative">
        {renderContent()}
      </div>
    </div>
  );
};