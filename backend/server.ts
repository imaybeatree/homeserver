import { fileURLToPath } from "url";
import express from "express";
import cors from 'cors';
import path from "path";
import { fetchMovieHandler, searchMoviesHandler, popularMoviesHandler, movieGenresHandler, movieDetailsHandler } from "./handlers/movie.handlers";
import { fetchTvShowHandler, popularTvShowsHandler, searchTvShowsHandler, tvDetailsHandler, tvEpisodeHandler, tvEpisodesHandler, tvGenresHandler } from "./handlers/tv.handlers";
import { removeSavedShowHandler, savedShowsHandler, saveShowHandler, updateProgressHandler } from "./handlers/savedShows.handlers";
import { loginHandler, meHandler, selectUserHandler, seedPassword } from "./handlers/auth.handlers";
import { verifyToken } from "./middleware/auth.middleware";
import { requestLogger } from "./middleware/request-logger.middleware";
import { networkInterfaces } from 'os';

function getLocalIpAddress(): string {
  let nets: ReturnType<typeof networkInterfaces>;

  try {
    nets = networkInterfaces();
  } catch {
    return 'localhost';
  }
  
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

seedPassword();

const server = app.listen(PORT, '0.0.0.0');

server.on("error", (error) => {
  console.error("Failed to start server:", error);
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    `http:/${IP}/:5173`,
    "http://192.168.68.61:5173",
    "http://hehexdpc.local:5173"
  ],
  credentials: true,
  exposedHeaders: ['X-Refresh-Token'],
}));

app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.get("/api/movie/:id", fetchMovieHandler);
app.get("/api/search/movie/:name/:page", searchMoviesHandler);
app.get("/api/popular/movie", popularMoviesHandler);
app.get("/api/tv/:id/:season/:episode", fetchTvShowHandler);
app.get("/api/search/tv/:name/:page", searchTvShowsHandler);
app.get("/api/popular/tv", popularTvShowsHandler);
app.get("/api/genre/movie", movieGenresHandler)
app.get("/api/genre/tv", tvGenresHandler)
app.get("/api/details/movie/:id",movieDetailsHandler)
app.get("/api/details/tv/:id",tvDetailsHandler)
app.get("/api/episode/:id/:season/:episode", tvEpisodeHandler)
app.get("/api/episodes/:id/:season", tvEpisodesHandler)
// Public — no token required
app.post("/api/auth/login", loginHandler)

// All routes below this line require a valid JWT
app.use('/api', verifyToken)

app.get("/api/auth/me", meHandler)
app.post("/api/auth/select-user", selectUserHandler)
app.get("/api/users/:userId/saved-shows", savedShowsHandler)
app.post("/api/users/:userId/saved-shows", saveShowHandler)
app.delete("/api/users/:userId/saved-shows/:mediaType/:mediaId", removeSavedShowHandler)
app.patch("/api/users/:userId/saved-shows/:mediaType/:mediaId/progress", updateProgressHandler)

const WEB_DIST = path.resolve(__dirname, "../../homeapp/dist");

app.use(express.static(WEB_DIST));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(WEB_DIST, "index.html"));
});
