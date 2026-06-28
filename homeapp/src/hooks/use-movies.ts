import { useEffect, useState } from "react";
import { apiFetch } from "./apiFetch";

export function useFetchMoviePlayer(id: string){
    const [playerHtml, setPlayerHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    const fetchPlayer = async () => {
        setLoading(true);
        setError('');

        try {
        const response = await apiFetch(`/api/movie/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to load player');
        }

        const html = await response.text();
        setPlayerHtml(html);
        } catch (err) {
        setError('Failed to load movie player. Please try again.');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    if (id) {
        fetchPlayer();
    }
    }, [id]);

    return {playerHtml, loading, error}
}