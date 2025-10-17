import React from 'react';

export const GeminiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-6 h-6"
    >
        <path 
            fillRule="evenodd" 
            d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.846.813l2.846-.813a.75.75 0 0 1 .966.444l.813 2.846a3.75 3.75 0 0 0 .813 2.846l-.813 2.846a.75.75 0 0 1-.966.444l-2.846-.813a3.75 3.75 0 0 0-2.846.813l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.846-.813l-2.846.813a.75.75 0 0 1-.966-.444l-.813-2.846a3.75 3.75 0 0 0-.813-2.846l.813-2.846a.75.75 0 0 1 .966-.444l2.846.813A3.75 3.75 0 0 0 9 5.313l.813-2.846A.75.75 0 0 1 9 4.5ZM13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" 
            clipRule="evenodd" 
        />
    </svg>
);