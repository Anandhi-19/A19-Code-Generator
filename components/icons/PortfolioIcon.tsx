import React from 'react';

export const PortfolioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w.3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v10.5m0 0l-3-3m3 3 3-3M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
    />
  </svg>
);
