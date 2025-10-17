import React from 'react';

export const PreviewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.436-7.447A1.012 1.012 0 0 1 7.494 4h9.012a1.012 1.012 0 0 1 .986.994l-4.436 7.447a1.012 1.012 0 0 1-1.012.639H3.024a1.012 1.012 0 0 1-.988-.994Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 12c0-2.036-1.126-3.85-2.833-4.793m-11.334 0A9.97 9.97 0 0 0 3 12c0 2.036 1.126 3.85 2.833 4.793m11.334 0A9.97 9.97 0 0 1 21 12c0-2.036-1.126-3.85-2.833-4.793"
    />
  </svg>
);