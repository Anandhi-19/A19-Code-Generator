import React from 'react';

interface VideoSplashScreenProps {
  onVideoEnd: () => void;
}

export const VideoSplashScreen: React.FC<VideoSplashScreenProps> = ({ onVideoEnd }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 bg-black">
      <video
        autoPlay
        muted
        playsInline
        onEnded={onVideoEnd}
        className="w-full h-full object-cover"
      >
        <source src="A3.mp4" type="video/mp4" />
        Your browser does not support the video tag. An intro video was meant to play here.
      </video>
    </div>
  );
};
