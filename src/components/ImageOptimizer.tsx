import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const ImageOptimizer: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin: '200px', // Start loading when image is 200px from viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Generate WebP version of the image if it's a jpg/png
  const getWebPSrc = () => {
    // For external URLs or SVGs, don't try to convert
    if (src.startsWith('http') || src.endsWith('.svg')) {
      return src;
    }

    // For local images, assume we have a WebP version with the same name
    const baseSrc = src.replace(/\.(jpe?g|png)$/i, '');
    return `${baseSrc}.webp`;
  };

  // Placeholder for image while loading
  const placeholder = (
    <div 
      className={`bg-gray-200 animate-pulse ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}
      aria-hidden="true"
    />
  );

  return (
    <>
      {!isLoaded && placeholder}
      {(isInView || priority) && (
        <picture>
          <source srcSet={getWebPSrc()} type="image/webp" />
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={() => setIsLoaded(true)}
            loading={priority ? 'eager' : 'lazy'}
          />
        </picture>
      )}
    </>
  );
};

export default ImageOptimizer;
