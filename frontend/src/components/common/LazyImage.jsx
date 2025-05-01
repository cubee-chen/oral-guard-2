// src/components/common/LazyImage.jsx
import React, { useState, useEffect } from 'react';

/**
 * LazyImage component for optimized image loading
 * - Progressive loading: Shows a low-quality placeholder while the actual image loads
 * - Uses native lazy loading for better performance
 * - Custom loading styles for smooth transitions
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4='
}) => {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
    setImageSrc(fallback);

    // Prefetch the image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
      console.error(`Failed to load image: ${src}`);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  return (
    <div 
      className={`lazy-image-container ${isLoaded ? 'loaded' : 'loading'} ${error ? 'error' : ''} ${className}`}
      style={{ width, height }}
    >
      <img 
        src={imageSrc} 
        alt={alt} 
        className="lazy-image"
        loading="lazy"
        onError={() => setError(true)}
      />
      {!isLoaded && !error && (
        <div className="lazy-image-placeholder">
          <div className="loading-spinner"></div>
        </div>
      )}
      {error && (
        <div className="lazy-image-error">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;