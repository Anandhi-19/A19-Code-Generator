import React from 'react';

interface MarkdownRendererProps {
    content: string;
}

// A helper function to parse inline markdown like **bold** text.
const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold tags
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        return part;
    });
};


export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    if (!content) return null;

    const lines = content.split('\n');
    
    const renderedElements: React.ReactElement[] = [];
    let ulistItems: React.ReactElement[] = [];
    let olistItems: React.ReactElement[] = [];

    const closeLists = (key: string) => {
        if (ulistItems.length > 0) {
            renderedElements.push(<ul key={`ul-${key}`} className="list-disc list-inside space-y-1 my-3">{ulistItems}</ul>);
            ulistItems = [];
        }
        if (olistItems.length > 0) {
            renderedElements.push(<ol key={`ol-${key}`} className="list-decimal list-inside space-y-1 my-3">{olistItems}</ol>);
            olistItems = [];
        }
    };

    lines.forEach((line, i) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('* ')) {
            if (olistItems.length > 0) closeLists(`list-${i}`);
            ulistItems.push(<li key={i}>{parseInline(trimmedLine.substring(2))}</li>);
        } else if (/^\d+\.\s/.test(trimmedLine)) {
            if (ulistItems.length > 0) closeLists(`list-${i}`);
            const content = trimmedLine.replace(/^\d+\.\s/, '');
            olistItems.push(<li key={i}>{parseInline(content)}</li>);
        } else {
            closeLists(`list-${i}`);
            
            if (trimmedLine.startsWith('# ')) {
                 renderedElements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2">{parseInline(trimmedLine.substring(2))}</h2>);
            } else if (trimmedLine.endsWith(':') && lines[i+1] && /^\d+\.\s/.test(lines[i+1].trim())) {
                 // Heuristic for subheadings like "Key Features:"
                 renderedElements.push(<h3 key={i} className="text-lg font-semibold mt-3 mb-1">{parseInline(trimmedLine)}</h3>);
            } else if (trimmedLine) {
                 renderedElements.push(<p key={i} className="my-2">{parseInline(trimmedLine)}</p>);
            }
        }
    });
    
    closeLists('last');

    return <>{renderedElements}</>;
};