import { authenticated } from "./request.handlers";
import { tmdbApi } from "./api.handlers";

export const fetchMovieHandler = authenticated(async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`https://vidsrcme.ru/embed/movie/${id}`);
    let html = await response.text();

    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    res.send(html);
  } catch (error) {
    console.error("Failed to fetch movie embed:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const searchMoviesHandler = authenticated(async (req, res) => {
  const { name, page } = req.params;

  try {
    const url = `search/movie?query=${name}&include_adult=false&language=en-US&page=${page}`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);

    
  } catch (error) {
    console.error("Failed to search movies:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const popularMoviesHandler = authenticated(async (req, res) => {

  try {
    const url = `movie/popular?language=en-US&page=1`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);


  } catch (error) {
    console.error("Failed to fetch popular movies:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const movieDetailsHandler = authenticated(async (req, res) => {
  const { id } = req.params;

  try {
    const url = `movie/${id}`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Failed to fetch movie details:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})

export const movieGenresHandler = authenticated(async (req, res) => {

  try {
    const url = `genre/movie/list`;
    const response = await tmdbApi(url);
    const data = await response.json();
    res.json(data);


  } catch (error) {
    console.error("Failed to fetch movie genres:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
})
