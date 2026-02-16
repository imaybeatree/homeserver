import React, {  useState } from 'react';
import PosterCard from '@/components/page/PosterCard';
import ItemDetails from '@/components/page/ItemDetails';
import { Input } from '@/components/ui/input';
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

const MainPage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header with Search Bar */}
      <div className="bg-neutral-800 p-8 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Start typing to search"
              className="rounded-full"
            />
            <Select value={mediaType} onValueChange={(val) => {setMediaType(val)
            if (searchQuery.length != 0) {setHasSearched(true)}
              }}>
              <SelectTrigger className="w-36 rounded-full">
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
      <div className="mx-auto max-w-7xl p-8">

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner className="size-8"/>
          </div>
        )}

        {!isLoading && hasSearched && media.length === 0 && searchQuery.length != 0 && (
          <div className="py-20 text-center text-gray-400">
            <p className="text-xl">No results found for "{searchQuery}"</p>
          </div>
        )}

        {!isLoading && media.length > 0 && (
          <>
            <div className="mb-6 text-gray-400">
              Showing {media.length} results{' '}
              {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map((item) => (
                <PosterCard key={item.id} media={item} onClick={handleMediaClick} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {currentPage > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
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
                        className="cursor-pointer"
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
                        className="cursor-pointer"
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
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
          <div className="py-10 text-gray-400">
            <div className="text-2xl font-bold text-white translate-x-1/50 mb-3">Popular Movies</div>
            {popMoviesLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner className="size-8"/>
            </div>
          ) : (
            <PopularShows media={popularMovies} handleMovieClick={handleMediaClick} />
          )}
          </div>
          <div className="py-10 text-gray-400">
            <div className="text-2xl font-bold text-white translate-x-1/50 mb-3">Popular Shows</div>
          {popShowsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner className="size-8"/>
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
          <DialogOverlay className="bg-black/80" />
          <DialogContent className="md:!w-1/3 md:!max-w-none max-h-[95vh] bg-gray-900 my-4 max-w-4xl m-0 p-0 rounded-none">
            <ItemDetails media={selectedMedia} />
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default MainPage;
