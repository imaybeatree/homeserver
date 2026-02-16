import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchPlayer } from '@/hooks/use-media';
import ShowSelect from '@/components/page/ShowSelect';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PlayerPageProps {
  id: string;
  season: string;
  episode: string;
  type: string;
  onBack?: () => void;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ id, type, season: initialSeason, episode: initialEpisode, onBack }) => {
  const [season, setSeason] = useState<string>(initialSeason);
  const [episode, setEpisode] = useState<string>(initialEpisode);
  const [source, setSource] = useState<string>('main');

  const isShow = type === 'tv'

  const {playerHtml, loading, error} = useFetchPlayer(id, type, season, episode, source)
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleSeasonChange = (season: string) => {
    setSeason(season)
    setEpisode("1")
  }

  

  return (
    <div className="min-h-screen bg-neutral-950 overflow-x-hidden">
      {/* Header with Back Button */}
      <div className="bg-neutral-900 p-4 shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-white">Now Playing on</h1>
          <Select value={source} onValueChange={(val) => {setSource(val)}}>
                <SelectTrigger className="w-36 rounded-full">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="main">Main player</SelectItem>
                  <SelectItem value="backup">Backup player</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* Player and ShowSelect*/}
      <div className="mx-auto mt-4 md:max-w-8/12 md:p-8 md:mt-0">
        <div className="flex flex-col lg:flex-row gap-6">


          {/* Player Container */}
        <div className="flex-1 flex justify-center lg:order-2">
          {loading && (
            <div className="flex justify-center items-center py-20 relative rounded-lg shadow-2xl w-full aspect-video">
              <Spinner className="size-10"/>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500 p-4 text-red-200 text-center">
              {error}
            </div>
          )}

          {!loading && !error && playerHtml && (
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl w-full aspect-video">
              {source === "main" ?  (

                 <iframe
                  className="absolute inset-0 w-full h-full"
                  srcDoc={playerHtml}
                  allowFullScreen
                  style={{ border: "none" }}
                  scrolling="no"
                />     
              ):
              (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={playerHtml}
                  allowFullScreen
                  style={{ border: "none" }}
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                />
              )}
  </div>
)}

        </div>

           {/* ShowSelect Component */}
          {isShow && (<div className="w-full max-h-128 lg:w-96 lg:order-1">
            <ShowSelect 
              id={id} 
              season={season}
              episode={episode}
              onSeasonChange={handleSeasonChange}
              onEpisodeChange={setEpisode}
            />
          </div>)}


        </div>
      </div>
    </div>
  );
};

export default PlayerPage;