import React from 'react';
import missingImage from '@/assets/missing_image.png';
import type { Media } from './types';
import { useFetchGenres } from '@/hooks/use-media';

interface PosterCardProps {
  media: Media;
  onClick?: (media: Media) => void;
}

export const PosterCard: React.FC<PosterCardProps> = ({ media, onClick }) => {
  const genres = useFetchGenres(media.genre_ids, media.media_type)
  if (!media) return

  const imageBaseUrl = 'https://image.tmdb.org/t/p/';
  const imageSize = 'w500';
  
  const posterUrl = media.poster_path 
    ? `${imageBaseUrl}${imageSize}${media.poster_path}`
    : missingImage;

  const handleClick = () => {
    if (onClick) {
      onClick(media);
    }
  };
  
  const release = media.media_type === "movie" ? media.release_date : media.first_air_date
  const year = release ? new Date(release).getFullYear() : 'N/A';
  return (
    <div 
      onClick={handleClick}
      className="poster-card"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") handleClick();
      }}
    >
      {/* Poster Image */}
      <div className="poster-image-wrap">
        <img 
          src={posterUrl}
          alt={media.media_type === "movie" ? media.title : media.name}
          className="poster-image"
        />
        
        {/* Overlay that appears on hover */}
        <div className="poster-overlay">
              <div className="genre-list">
                {genres.map((name) => (
                  <span
                    key={name}
                    className="genre-pill"
                  >
                    {name}
                  </span>
                ))}
              </div>
        </div>

      </div>

      <div className="poster-info">
        <h3 className="poster-title">
          {media.media_type === "movie" ? media.title : media.name}
        </h3>
        <p className="poster-year">{year}</p>
      </div>
    </div>
  );
};

export default PosterCard
