/* eslint-disable react/prop-types */
import React from 'react';

/**
 * @typedef ThumbnailProps
 * @property {string} src
 * @property {string} alt
 * @property {string?} previewUrl
 * @property {number?} previewWidth
 * @property {number?} originalWidth
 * @property {number?} defaultWidth
 * @property {(() => void)?} onClick
 */
/**
 * @param {ThumbnailProps} param0
 */
const Thumbnail = ({ src, alt, previewUrl, previewWidth, originalWidth, defaultWidth, onClick }) => {
  const width = defaultWidth;
  const originalUrl = src;
  const hasSize = typeof originalWidth === 'number' && typeof previewWidth === 'number';

  const srcSet = hasSize ? `${originalUrl} ${originalWidth}w, ${previewUrl} ${previewWidth}w` : null;
  const sizes  = hasSize && (width > 0) ? `${width}px` : null;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      title={alt}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      role='link'
    />
  );
};

export default Thumbnail;
