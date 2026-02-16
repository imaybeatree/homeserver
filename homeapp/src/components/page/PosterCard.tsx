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
      className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-3xl active:scale-95"
    >
      {/* Poster Image */}
      <div className="relative overflow-hidden bg-gray-800">
        <img 
          src={posterUrl}
          alt={media.media_type === "movie" ? media.title : media.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex flex-wrap gap-1">
                {genres.map((name) => (
                  <span
                    key={name}
                    className="border-2 text-white text-xs font-semibold px-2 py-1 rounded-2xl"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-gray-900 p-4 text-center">
        <h3 className="md:text-lg text-sm font-semibold text-white line-clamp-1 group-hover:text-yellow-500 transition-colors">
          {media.media_type === "movie" ? media.title : media.name}
        </h3>
        <p className="text-sm text-gray-400">{year}</p>
      </div>
    </div>
  );
};

export default PosterCard