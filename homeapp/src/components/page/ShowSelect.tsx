import { useFetchTvDetails } from '@/hooks/use-tv';
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { useFetchSeasonEpisodes } from '@/hooks/use-tv';
import { Spinner } from '../ui/spinner';

interface ShowSelectProps {
  id: string;
  season: string;
  episode: string;
  onSeasonChange: (season: string) => void;
  onEpisodeChange: (episode: string) => void;
}

export const ShowSelect: React.FC<ShowSelectProps> = ({ 
  id, 
  season, 
  episode,
  onSeasonChange,
  onEpisodeChange 
}) => {
  const { tvDetails } = useFetchTvDetails(id);
  const { episodes, loading, error } = useFetchSeasonEpisodes(id, season);
  
  const seasonsTotal = tvDetails?.number_of_seasons 
    ? Array.from({ length: tvDetails.number_of_seasons }, (_, i) => i + 1)
    : [];

  return (
    <div>
      <div className="episode-head">
        <h2 className="episode-title">Episodes</h2>
        <Select value={season} onValueChange={onSeasonChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {seasonsTotal.map((seasonNum) => (
                <SelectItem key={seasonNum} value={seasonNum.toString()}
                >
                  Season {seasonNum}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <ScrollArea className="episode-scroll">
        <div className="episode-scroll-inner">
          {loading ? (
            <div className="muted-text"><Spinner className="spinner-sm"/>Loading episodes</div>
          ) : error ? (
            <div className="error-box">{error}</div>
          ) : episodes.length === 0 ? (
            <div className="muted-text">No episodes found</div>
          ) : (
            episodes.map((episodeName, index) => {
              const episodeNumber = (index + 1).toString();
              const isSelected = episodeNumber === episode;
              return (
                <div key={index}>
                  <Button
                    className={`episode-button ${isSelected ? 'episode-button-active' : ''}`}
                    onClick={() => onEpisodeChange(episodeNumber)}
                  >
                    <span>
                      {index + 1}. {episodeName}
                    </span>
                  </Button>
                  <Separator className="my-2" />
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ShowSelect;
