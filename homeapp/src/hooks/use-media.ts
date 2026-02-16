import type { Genre, Media, Movie, SearchResponse, TvShow } from "@/components/page/types";
import { useEffect, useState } from "react";
import { getBackendUrl } from "./backendUrl";

const backend = getBackendUrl();


function formatType(media :Media[], type: string){

    const searchTyped: Media[] =
    type === 'movie'
        ? (media.map(item => ({
            ...item,
            media_type: 'movie' as const,
        })) as Movie[])
        : (media.map(item => ({
            ...item,
            media_type: 'tv' as const,
        })) as TvShow[]);

    return searchTyped
}

export function useSearchMedia(query: string, page: number, type: string) {
  const [media, setMedia] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState(false);

    if (type != 'movie' && type != 'tv') {
        type = 'movie'
    }

  useEffect(() => {

    if (!query.trim()) {
      setError("Please enter a search term");
      setMedia([]);
      return;
    }


    const fetchMedia = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${backend}/api/search/${type}/${query}/${page}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${type}`);
        }

        const data: SearchResponse = await response.json();

        const searchTyped = formatType(data.results, type)
        setMedia(searchTyped);
        setTotalPages(data.total_pages);
        setCurrentPage(data.page);
        setHasSearched(true);
      } catch (err) {
        console.error(err);
        setError("Failed to search movies. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [query, page, type]);

  return { media, error, isLoading, totalPages, currentPage, hasSearched };
}

export function useSearchPopular(type: string) {
    const [popular, setPopular] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    setIsLoading(true);
    const fetchPopular = async () => {
        try {
        const response = await fetch(`${backend}/api/popular/${type}`);
        if (!response.ok) throw new Error(`Failed to fetch popular ${type}`);

        const data: SearchResponse = await response.json();
        const searchTyped = formatType(data.results, type)
        setPopular(searchTyped);
        } catch (err) {
        console.error('Failed to load popular movies:', err);
        }
        finally {
        setIsLoading(false);
      }
    };

    if (type) {
        fetchPopular();
    }
    }, [popular.length, type]);

    return { isLoading, popular }
}


export function useFetchGenres(genreIds: number[], mediaType: string) {
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    if (!genreIds || genreIds.length === 0) {
      setGenres([]);
      return;
    }

    const fetchGenres = async () => {
      try {
        const res = await fetch(`${backend}/api/genre/${mediaType}`);
        const data = await res.json();
        const genres: Genre[] = data.genres

        const genreMap = new Map(genres.map((g) => [g.id, g.name]));
        const genreNames = genreIds.map((id) => genreMap.get(id) || "Unknown");
        setGenres(genreNames);
      } catch (err) {
        console.error(err);
        setGenres([]);
      }
    };

    fetchGenres();
  }, [genreIds, mediaType]);

  return genres;
}


export function useFetchPlayer(id: string, type: string, season: string | null, episode: string | null, source: string){
    const [playerHtml, setPlayerHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlayer = async () => {
            setLoading(true);
            setError('');

            try {
                let response;
                let html;

                if(source == 'main'){
                                    if (type === 'movie'){
                      response = await fetch(`${backend}/api/movie/${id}`);
                  } else {
                      response = await fetch(`${backend}/api/tv/${id}/${season}/${episode}`);
                  }
                  
                  if (!response.ok) {
                      throw new Error('Failed to load player');
                  }

                  html = await response.text();

                }else {
                  if (type === 'movie'){
                    html = `https://vidlink.pro/movie/${id}`
                  } else{
                    html = `https://vidlink.pro/tv/${id}/${season}/${episode}`
                  }
                }


                setPlayerHtml(html);
            } catch (err) {
                setError('Failed to load player. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlayer();
        }
    }, [id, type, season, episode, source]);

    return {playerHtml, loading, error}
}