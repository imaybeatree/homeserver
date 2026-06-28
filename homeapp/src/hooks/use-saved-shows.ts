import type { Media } from "@/components/page/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, getUserFromToken } from "./apiFetch";

export const FAMILY_USERS = ["mom", "dad", "ryan", "chloe"] as const;
export type FamilyUser = (typeof FAMILY_USERS)[number];

export function getCurrentUser(): FamilyUser | null {
  const user = getUserFromToken();
  return FAMILY_USERS.includes(user as FamilyUser) ? (user as FamilyUser) : null;
}

export function useSavedShows(userId: FamilyUser | null) {
  const [savedShows, setSavedShows] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedKeys = useMemo(
    () => new Set(savedShows.map((show) => `${show.media_type}:${show.id}`)),
    [savedShows],
  );

  const refresh = useCallback(async () => {
    if (!userId) {
      setSavedShows([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/users/${userId}/saved-shows`);
      if (!response.ok) throw new Error("Failed to load saved shows");

      const data: { results: Media[] } = await response.json();
      setSavedShows(data.results);
    } catch (err) {
      console.error(err);
      setError("Failed to load saved shows.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveShow = useCallback(
    async (media: Media) => {
      if (!userId) return;

      const response = await apiFetch(`/api/users/${userId}/saved-shows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(media),
      });

      if (!response.ok) throw new Error("Failed to save show");
      await refresh();
    },
    [refresh, userId],
  );

  const removeShow = useCallback(
    async (media: Media) => {
      if (!userId) return;

      const response = await fetch(
        `${backend}/api/users/${userId}/saved-shows/${media.media_type}/${media.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to remove show");
      await refresh();
    },
    [refresh, userId],
  );

  const isSaved = useCallback(
    (media: Media | null) => Boolean(media && savedKeys.has(`${media.media_type}:${media.id}`)),
    [savedKeys],
  );

  return { error, isLoading, isSaved, refresh, removeShow, savedShows, saveShow };
}
