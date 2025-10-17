import React from 'react';
import Logo from '../public/AS2.png'; // adjust relative path

export const A19Icon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img
    {...props}
    src={Logo}
    alt="My Logo"
     // change size here
  />
);
