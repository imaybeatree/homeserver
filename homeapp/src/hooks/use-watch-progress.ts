import { getBackendUrl } from './backendUrl';

const backend = getBackendUrl();

export async function setWatchProgress(
  userId: string,
  mediaId: string,
  mediaType: string,
  season: string,
  episode: string,
): Promise<void> {
  try {
    await fetch(`${backend}/api/users/${userId}/saved-shows/${mediaType}/${mediaId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season, episode }),
    });
  } catch {
    // fire-and-forget — don't surface network errors to the user
  }
}
