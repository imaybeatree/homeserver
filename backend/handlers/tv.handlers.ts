import { authenticated } from "./request.handlers";
import { tmdbApi } from "./api.handlers";

export const fetchTvShowHandler = authenticated(async (req, res) => {
  const { id, season, episode } = req.params;

  try {
    const response = await fetch(`https://vidsrcme.ru/embed/tv/${id}/${season}/${episode}`);
    let html = await response.text();

    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    res.send(html);
  } catch (error) {
    console.error("Failed to fetch TV show embed:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const searchTvShowsHandler = authenticated(async (req, res) => {
  const { name, page } = req.params;

  try {
    const url = `search/tv?query=${name}&include_adult=false&language=en-US&page=${page}`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);

	    
  } catch (error) {
    console.error("Failed to search TV shows:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const popularTvShowsHandler = authenticated(async (req, res) => {
  try {
    const url = `tv/popular?language=en-US&page=1`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Failed to fetch popular TV shows:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }

})

export const tvGenresHandler = authenticated(async (req, res) => {

  try {
    const url = `genre/tv/list`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);


  } catch (error) {
    console.error("Failed to fetch TV genres:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})


export const tvDetailsHandler = authenticated(async (req, res) => {
  const { id } = req.params;

  try {
    const url = `tv/${id}`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Failed to fetch TV details:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const tvEpisodeHandler = authenticated(async (req, res) => {
  const { id, season, episode} = req.params;

  try {
    const url = `tv/${id}/season/${season}/episode/${episode}`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Failed to fetch TV episode:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const tvEpisodesHandler = authenticated(async (req, res) => {
  const { id, season } = req.params;

  try {
    const url = `tv/${id}/season/${season}`;
    const response = await tmdbApi(url);
    const data = await response.json();
    const result = data.episodes
    res.json(result);

  } catch (error) {
    console.error("Failed to fetch TV episodes:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})
