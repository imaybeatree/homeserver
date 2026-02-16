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
    <div className="w-full max-w h-full">
      <div className="flex items-center justify-between mb-4 p-2">
        <h2 className="text-2xl font-bold text-white">Episodes</h2>
        <Select value={season} onValueChange={onSeasonChange}>
          <SelectTrigger className="w-36 rounded-full">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent className="max-h-60 rounded-2xl bg-neutral-800">
            <SelectGroup>
              {seasonsTotal.map((seasonNum) => (
                <SelectItem key={seasonNum} value={seasonNum.toString()}
                className="data-[state=checked]:bg-slate-200 data-[state=checked]:text-black rounded-xs">
                  Season {seasonNum}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <ScrollArea className="h-[calc(100vw*0.9-4rem)] lg:h-[calc((100vw-24rem-6rem)*0.31)] w-full border border-slate-200 rounded-2xl bg-neutral-950 shadow-lg">
        <div className="p-4">
          {loading ? (
            <div className="text-white text-center items-center gap-1 flex"> <Spinner className="size-5"/>Loading episodes</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : episodes.length === 0 ? (
            <div className="text-white text-center">No episodes found</div>
          ) : (
            episodes.map((episodeName, index) => {
              const episodeNumber = (index + 1).toString();
              const isSelected = episodeNumber === episode;
              return (
                <div key={index}>
                  <Button
                    className={`w-full text-left justify-start rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected 
                        ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-white font-semibold' 
                        : 'bg-gradient-to-r  text-white'
                    }`}
                    onClick={() => onEpisodeChange(episodeNumber)}
                  >
                    <span className="font-medium">
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