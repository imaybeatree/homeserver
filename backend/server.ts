import { fileURLToPath } from "url";
import express from "express";
import cors from 'cors';
import path from "path";
import { fetchMovieHandler, searchMoviesHandler, popularMoviesHandler, movieGenresHandler } from "./handlers/movie.handlers";
import { fetchTvShowHandler, popularTvShowsHandler, searchTvShowsHandler, tvDetailsHandler, tvEpisodeHandler, tvEpisodesHandler, tvGenresHandler } from "./handlers/tv.handlers";
import { networkInterfaces } from 'os';

function getLocalIpAddress(): string {
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  
  return 'localhost';
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const IP = getLocalIpAddress();
// const FILE_DIR = path.join(__dirname, "files"); // project-root/files

// app.use("/files", express.static(FILE_DIR));
// app.use("/files", express.static(FILE_DIR));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://${IP}:${PORT}/`);
});

app.use(cors({
  origin: [
    "http://localhost:5173",   
    `http:/${IP}/:5173`,
    "http://192.168.68.61:5173",
    "http://hehexdpc.local:5173"
  ],
  credentials: true
}));


app.get("/api/movie/:id", fetchMovieHandler);
app.get("/api/search/movie/:name/:page", searchMoviesHandler);
app.get("/api/popular/movie", popularMoviesHandler);
app.get("/api/tv/:id/:season/:episode", fetchTvShowHandler);
app.get("/api/search/tv/:name/:page", searchTvShowsHandler);
app.get("/api/popular/tv", popularTvShowsHandler);
app.get("/api/genre/movie", movieGenresHandler)
app.get("/api/genre/tv", tvGenresHandler)
app.get("/api/details/tv/:id",tvDetailsHandler)
app.get("/api/episode/:id/:season/:episode", tvEpisodeHandler)
app.get("/api/episodes/:id/:season", tvEpisodesHandler)
