import React, {  useState } from 'react';
import { LogOut } from 'lucide-react';
import PosterCard from '@/components/page/PosterCard';
import ItemDetails from '@/components/page/ItemDetails';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Media} from '@/components/page/types';
import { PopularShows } from '@/components/page/PopularShows';
import { useSearchMedia, useSearchPopular } from '@/hooks/use-media';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrentUser, useSavedShows } from '@/hooks/use-saved-shows';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<string>('movie')
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  //Fetch search results using the custom hook
  const { media, isLoading, totalPages } = useSearchMedia(searchQuery, currentPage, mediaType);

  //Fetch popular movies (only once)
  const {  popular: popularShows, isLoading: popShowsLoading }= useSearchPopular('tv')
  const {  popular: popularMovies, isLoading: popMoviesLoading }= useSearchPopular('movie')
  const {
    error: savedShowsError,
    isLoading: savedShowsLoading,
    savedShows,
  } = useSavedShows(currentUser);

  //Handle search input with debounce
  const handleInputChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      if (value.trim()) {
        setCurrentPage(1);
        setHasSearched(true);
      } else {
        setHasSearched(false);
      }
    }, 500);

    setDebounceTimer(timer);
  };

  //Handle Enter key (instant search)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (searchQuery.trim()) {
        setCurrentPage(1);
        setHasSearched(true);
      }
    }
  };

  //Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  //Handle media click
  const handleMediaClick = (media: Media) => {
    setSelectedMedia(media);
  };

  const handleSwitchUser = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
    navigate('/select');
  };

  return (
    <div className="app-shell">
      {/* Header with Search Bar */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="user-bar">
            <div>
              <div className="user-bar-label">Watching as</div>
              <div className="user-bar-name">{currentUser}</div>
            </div>
            <Button className="tv-button-ghost user-switch-button" onClick={handleSwitchUser}>
              <LogOut />
              Switch
            </Button>
          </div>
          <div className="toolbar-row">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Start typing to search"
            />
            <Select value={mediaType} onValueChange={(val) => {setMediaType(val)
            if (searchQuery.length != 0) {setHasSearched(true)}
              }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="page-wrap">

        {isLoading && (
          <div className="center-panel">
            <Spinner />
          </div>
        )}

        {!isLoading && hasSearched && media.length === 0 && searchQuery.length != 0 && (
          <div className="center-panel muted-text">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}

        {!isLoading && media.length > 0 && (
          <>
            <div className="results-meta">
              Showing {media.length} results{' '}
              {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
            </div>

            <div className="poster-grid" style={{ marginTop: 24 }}>
              {media.map((item) => (
                <PosterCard key={item.id} media={item} onClick={handleMediaClick} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'disabled-link' : ''}
                    />
                  </PaginationItem>

                  {currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'disabled-link' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Show Popular Movies if Not Searching */}
        {!hasSearched && !isLoading && (
          <div>
          <div className="section muted-text">
            <div className="section-title">{currentUser}'s Saved Shows</div>
            {savedShowsLoading ? (
            <div className="center-panel">
              <Spinner />
            </div>
          ) : savedShowsError ? (
            <div className="empty-saved">{savedShowsError}</div>
          ) : savedShows.length > 0 ? (
            <PopularShows
              media={savedShows}
              handleMovieClick={handleMediaClick}
              getProgress={(m: Media) => m.media_type === 'tv' && m.last_season ? { season: m.last_season, episode: m.last_episode || '1' } : null}
            />
          ) : (
            <div className="empty-saved">Save movies and TV shows to see them here.</div>
          )}
          </div>
          <div className="section muted-text">
            <div className="section-title">Popular Movies</div>
            {popMoviesLoading ? (
            <div className="center-panel">
              <Spinner />
            </div>
          ) : (
            <PopularShows media={popularMovies} handleMovieClick={handleMediaClick} />
          )}
          </div>
          <div className="section muted-text">
            <div className="section-title">Popular Shows</div>
          {popShowsLoading ? (
            <div className="center-panel">
              <Spinner />
            </div>
          ) : (
            <PopularShows media={popularShows} handleMovieClick={handleMediaClick} />
          )}
          </div>
          </div>
        )}

        {/* Dialog for Selected Media */}
        <Dialog
          open={!!selectedMedia}
          onOpenChange={(open) => {
            if (!open) setSelectedMedia(null);
          }}
        >
          <DialogOverlay />
          <DialogContent>
            <ItemDetails media={selectedMedia} />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default MainPage;
