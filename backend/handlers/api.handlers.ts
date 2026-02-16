export const tmdbApi = async (url: string): Promise<Response> => {
  const fullUrl = `https://api.themoviedb.org/3/${url}`;
  
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZDE3NDg5ZGM5OGMzMzE3MzQ1MTU0MjgzMzhiOWYyYSIsIm5iZiI6MTc1NzQ1ODc0My4xMiwic3ViIjoiNjhjMGIxMzc5MzRjMTU0Y2ViOGNmYzZkIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.E65lmkIXe-vfGQ4eo5QkKt-us6qhbeJlkh4LS24obU4`
    },
  };

  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response;
};