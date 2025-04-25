import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  placeholderSrc?: string;
  threshold?: number;
  effect?: 'blur' | 'black-and-white' | 'opacity';
}

/**
 * OptimizedImage component that uses lazy loading for better performance
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  style = {},
  placeholderSrc,
  threshold = 100,
  effect = 'blur',
}) => {
  return (
    <LazyLoadImage
      alt={alt}
      src={src}
      className={className}
      effect={effect}
      width={width}
      height={height}
      style={style}
      placeholderSrc={placeholderSrc}
      threshold={threshold}
    />
  );
};

export default OptimizedImage;
