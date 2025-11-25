import React, { useState, useEffect, useRef } from 'react';

function RingDesigner() {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('800px');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
      
      // Adjust iframe height based on content
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          // Get the height of the iframe content
          const height = iframe.contentWindow.document.body.scrollHeight;
          setIframeHeight(`${height}px`);
        }
      } catch (error) {
        console.error("Cannot access iframe content due to cross-origin restrictions");
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  return (
    <div className="ring-designer-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
      {isLoading && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          zIndex: 10
        }}>
          <p>Loading Ring Designer...</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src="https://www.jweel.com/html/stylering.html"
        title="Ring Designer Tool"
        width="100%"
        height={iframeHeight}
        style={{
          border: 'none',
          overflow: 'hidden',
          // This makes the iframe start at a position below the navbar
          marginTop: '-80px', // Adjust this value based on the navbar height
        }}
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    </div>
  );
}

export default RingDesigner;