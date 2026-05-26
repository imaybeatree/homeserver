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
<div className="details">
  {/* Poster Image */}
  <div className="details-hero">
    <img
      src={backdropUrl}
      alt={media.media_type === "movie" ? media.title : media.name}
      className="details-image"
    />

    <div>
      <div className="details-shade" />
      
      <div>
        <h2 className="details-title">
          {media.media_type === "movie" ? media.title : media.name}
        </h2>
      </div>
     
      <div className="details-action">
        <Button
          className="tv-button-wide tv-button-large"
          onClick={() => navigate(`/watch/${media.media_type}/${media.id}`)}
        >
          Watch
        </Button>
      </div>
    </div>
  </div>

  {/* Title and button below image on mobile */}
  {/* Overview */}
  <div className="details-copy">
    {media.overview}
  </div>
</div>
  );
};

export default ItemDetails
