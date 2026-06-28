import type { Genre, Media, Movie, MovieDetails, SearchResponse, TVDetails, TvShow } from "@/components/page/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "./apiFetch";


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
        const response = await apiFetch(`/api/search/${type}/${query}/${page}`);

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
        const response = await apiFetch(`/api/popular/${type}`);
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
    }, [type]);

    return { isLoading, popular }
}


interface GenreContextValue {
  lookupGenres: (ids: number[], mediaType: string) => string[];
}

const GenreContext = createContext<GenreContextValue>({ lookupGenres: () => [] });

export function useGenres() {
  return useContext(GenreContext);
}

export function GenreProvider({ children }: { children: ReactNode }) {
  const [tvMap, setTvMap] = useState<Map<number, string>>(new Map());
  const [movieMap, setMovieMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    apiFetch('/api/genre/tv')
      .then((r) => r.json())
      .then((data) => setTvMap(new Map((data.genres as Genre[]).map((g) => [g.id, g.name]))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch('/api/genre/movie')
      .then((r) => r.json())
      .then((data) => setMovieMap(new Map((data.genres as Genre[]).map((g) => [g.id, g.name]))))
      .catch(() => {});
  }, []);

  const lookupGenres = useCallback(
    (ids: number[], mediaType: string) => {
      const map = mediaType === 'tv' ? tvMap : movieMap;
      return ids.map((id) => map.get(id) ?? 'Unknown');
    },
    [tvMap, movieMap],
  );

  return <GenreContext.Provider value={{ lookupGenres }}>{children}</GenreContext.Provider>;
}

export function useFetchMediaDetails(id: string, type: string) {
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const mediaType = type === 'tv' ? 'tv' : 'movie';
        const response = await apiFetch(`/api/details/${mediaType}/${id}`);

        if (!response.ok) {
          throw new Error('Failed to load media details');
        }

        const data: MovieDetails | TVDetails = await response.json();
        const genreIds = data.genres?.map((genre) => genre.id) || [];

        if (mediaType === 'movie') {
          const movie = data as MovieDetails;
          setMedia({
            id: movie.id,
            adult: movie.adult,
            genre_ids: genreIds,
            original_language: movie.original_language,
            overview: movie.overview,
            popularity: movie.popularity,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            video: movie.video,
            media_type: 'movie',
            original_title: movie.original_title,
            release_date: movie.release_date,
            title: movie.title,
          });
        } else {
          const tv = data as TVDetails;
          setMedia({
            id: tv.id,
            adult: tv.adult,
            genre_ids: genreIds,
            original_language: tv.original_language,
            overview: tv.overview,
            popularity: tv.popularity,
            poster_path: tv.poster_path,
            backdrop_path: tv.backdrop_path,
            vote_average: tv.vote_average,
            vote_count: tv.vote_count,
            video: false,
            media_type: 'tv',
            original_name: tv.original_name,
            first_air_date: tv.first_air_date,
            name: tv.name,
          });
        }
      } catch (err) {
        setMedia(null);
        setError('Failed to load media details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, type]);

  return { media, loading, error };
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
                      response = await apiFetch(`/api/movie/${id}`);
                  } else {
                      response = await apiFetch(`/api/tv/${id}/${season}/${episode}`);
                  }
                  
                  if (!response.ok) {
                      throw new Error('Failed to load player');
                  }

                  html = await response.text();

                }else {
                  if (type === 'movie'){
                    html = `https://111movies.net/movie/${id}`
                  } else{
                    html = `https://111movies.net/tv/${id}/${season}/${episode}`
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
