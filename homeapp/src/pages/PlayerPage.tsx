import React, { useState } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchMediaDetails, useFetchPlayer } from '@/hooks/use-media';
import ShowSelect from '@/components/page/ShowSelect';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, useSavedShows } from '@/hooks/use-saved-shows';

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
  const [source, setSource] = useState<string>('backup');
  const [currentUser] = useState(getCurrentUser());
  const [saveError, setSaveError] = useState('');

  const isShow = type === 'tv'

  const {playerHtml, loading, error} = useFetchPlayer(id, type, season, episode, source)
  const { media, loading: detailsLoading } = useFetchMediaDetails(id, type)
  const { isSaved, removeShow, saveShow } = useSavedShows(currentUser)
  
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

  const handleToggleSaved = async () => {
    if (!media) return;

    setSaveError('');

    try {
      if (isSaved(media)) {
        await removeShow(media);
      } else {
        await saveShow(media);
      }
    } catch (err) {
      console.error(err);
      setSaveError('Could not update saved shows.');
    }
  };

  const wrappedHtml = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: black; }
      #the_frame { width: 100%; height: 100%; }
    </style>
    ${playerHtml}
  `;

  return (
    <div className="player-shell">
      {/* Header with Back Button */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="player-toolbar">
            <Button
              variant="ghost"
              onClick={handleBack}
            >
              <ArrowLeft />
              Back
            </Button>
            <h1 className="section-title player-title">Now Playing on</h1>
            <Select value={source} onValueChange={(val) => {setSource(val)}}>
                  <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="backup">Main player</SelectItem>
                    {/* <SelectItem value="backup">Backup player</SelectItem> */}
                  </SelectGroup>
                </SelectContent>
              </Select>
            <Button
              className="save-player-button"
              onClick={handleToggleSaved}
              disabled={detailsLoading || !media}
            >
              {media && isSaved(media) ? <BookmarkCheck /> : <Bookmark />}
              {media && isSaved(media) ? 'Saved' : 'Save'}
            </Button>
          </div>
          {saveError && <div className="player-save-error">{saveError}</div>}
        </div>
      </div>

      {/* Player and ShowSelect*/}
      <div className="player-layout">
        <div className="player-row">


          {/* Player Container */}
        <div className="player-main">
          {loading && (
            <div className="player-frame">
              <div className="player-frame-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spinner className="spinner-lg"/>
              </div>
            </div>
          )}

          {error && (
            <div className="error-player">
              {error}
            </div>
          )}

          {!loading && !error && playerHtml && (
            <div className="player-frame">
              {source === "main" ?  (

                 <iframe
                  srcDoc={wrappedHtml}
                  allowFullScreen
                  style={{ border: "none" }}
                  scrolling="no"
                />     
              ):
              (
                <iframe
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
          {isShow && (<div className="episode-panel">
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
