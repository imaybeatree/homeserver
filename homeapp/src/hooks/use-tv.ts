import type { Episode, TVDetails } from "@/components/page/types";
import { useEffect, useState } from "react";
import { getBackendUrl } from "./backendUrl";

const backend = getBackendUrl();

export function useFetchTvDetails(id: string){
    const [tvDetails, setTvDetails] = useState<TVDetails>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    const fetchDetails = async () => {
        setLoading(true);
        setError('');

        try {
        const response = await fetch(`${backend}/api/details/tv/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to load details');
        }

        const data = await response.json();
        setTvDetails(data);
        } catch (err) {
        setError('Failed to load show details. Please try again.');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    if (id) {
        fetchDetails();
    }
    }, [id]);

    return {tvDetails , loading, error}
}

export function useFetchEpisodeDetails(id: string, season: string, episode: string){
    const [tvDetails, setTvDetails] = useState<Episode>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    const fetchDetails = async () => {
        setLoading(true);
        setError('');

        try {
        const response = await fetch(`${backend}/api/episode/${id}/${season}/${episode}`);
        
        if (!response.ok) {
            throw new Error('Failed to load details');
        }

        const data = await response.json();
        setTvDetails(data);
        } catch (err) {
        setError('Failed to load show details. Please try again.');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    if (id) {
        fetchDetails();
    }
    }, [id, episode, season]);

    return {tvDetails , loading, error}
}

export function useFetchSeasonEpisodes(id: string, season: string) {
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeasonEpisodes = async () => {
      setLoading(true);
      setError('');

      try {

        const response = await fetch(`${backend}/api/episodes/${id}/${season}`);
        
        if (!response.ok) {
          throw new Error('Failed to load season details');
        }

        const data = await response.json();
        

        const episodeNames = data?.map((ep: Episode) => ep.name) || [];
        setEpisodes(episodeNames);
      } catch (err) {
        setError('Failed to load episodes. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id && season) {
      fetchSeasonEpisodes();
    }
  }, [id, season]);

  return { episodes, loading, error };
}