import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import AccessPage from './pages/AccessPage';
import WelcomePage from './pages/Welcome';
import { ProtectedRoute } from './components/page/ProtectedRoute';
import MainPage from './pages/MainPage';
import PlayerPage from './pages/PlayerPage';

function PlayerPageWrapper() {
  const { type, id } = useParams<{ type: string, id: string}>();
  let { season, episode } = useParams<{season: string | undefined, episode: string | undefined }>();
  const navigate = useNavigate();
  if (type == 'tv'){
    if(!season){
      season = "1"
    }
    if(!episode){
      episode = "1"
    }
  }

  return (
    <PlayerPage 
      id ={id || ''}
      season ={season || ''}
      episode ={episode || ''}
      type ={type || ''} 
      onBack={() => navigate('/main')} 
    />
  );
}

function SelectRoute() {
  return sessionStorage.getItem('appUnlocked') === 'true'
    ? <WelcomePage />
    : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccessPage />} />
        <Route path="/select" element={<SelectRoute />} />
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/watch/:type/:id" 
          element={
            <ProtectedRoute>
              <PlayerPageWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/watch/:type/:id/:season/:episode" 
          element={
            <ProtectedRoute>
              <PlayerPageWrapper />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;