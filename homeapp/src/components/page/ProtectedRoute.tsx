import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, setToken } from '@/hooks/apiFetch';
import { getBackendUrl } from '@/hooks/backendUrl';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

type Status = 'loading' | 'ok' | 'no-token' | 'no-user';

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus('no-token');
      return;
    }

    const backend = getBackendUrl();
    fetch(`${backend}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const refreshed = res.headers.get('X-Refresh-Token');
        if (refreshed) setToken(refreshed);
        if (!res.ok) { setStatus('no-token'); return null; }
        return res.json();
      })
      .then((data: { user: string | null } | null) => {
        if (!data) return;
        setStatus(data.user ? 'ok' : 'no-user');
      })
      .catch(() => setStatus('no-token'));
  }, []);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner className="spinner-lg" />
      </div>
    );
  }
  if (status === 'no-token') return <Navigate to="/" replace />;
  if (status === 'no-user') return <Navigate to="/select" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
