import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '../ui/button';
import type { Media } from './types';
interface ItemDetailsProps {
  media: Media | null;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ media }) => {
      const navigate = useNavigate();
    if (!media){
        return
    }

  const imageBaseUrl = 'https://image.tmdb.org/t/p/';
  const imageSize = 'original';
  
  const backdropUrl = media.poster_path 
    ? `${imageBaseUrl}${imageSize}${media.backdrop_path}`
    : 'https://via.placeholder.com/500x750/1f2937/ffffff?text=No+Poster';

  // const release = media.media_type === "movie" ? media.release_date : media.first_air_date
  // const year = release ? new Date(release).getFullYear() : 'N/A';


  return (
<div className="group relative rounded-lg shadow-lg max-h-screen overflow-y-auto">
  {/* Poster Image */}
  <div className="relative bg-gray-800">
    <img
      src={backdropUrl}
      alt={media.media_type === "movie" ? media.title : media.name}
      className="h-[40vh] md:h-full w-full object-cover"
    />

    {/* Overlay and content visible on desktop only */}
    <div className="hidden md:block">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
      
      <div className="absolute top-0 left-0 p-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
          {media.media_type === "movie" ? media.title : media.name}
        </h2>
      </div>
     
      <div className='bottom-5 absolute left-5'>
        <Button
          className="mt-3 md:w-3xs h-12 rounded-2xl text-2xl hover:opacity-80 cursor-pointer"
          onClick={() => navigate(`/watch/${media.media_type}/${media.id}`)}
        >
          Watch
        </Button>
      </div>
    </div>
  </div>

  {/* Title and button below image on mobile */}
  <div className="md:hidden p-4 bg-gray-900">
    <h2 className="text-2xl font-bold text-white mb-3">
      {media.media_type === "movie" ? media.title : media.name}
    </h2>
    <Button
      className="w-full h-12 rounded-2xl text-xl hover:opacity-80 cursor-pointer"
      onClick={() => navigate(`/watch/${media.media_type}/${media.id}`)}
    >
      Watch
    </Button>
  </div>

  {/* Overview */}
  <div className="p-4 text-gray-300 bg-gray-900">
    {media.overview}
  </div>
</div>
  );
};

export default ItemDetails