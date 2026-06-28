import React, { useState, useEffect } from 'react';
import { Sparkles, UserRound } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { FAMILY_USERS, type FamilyUser } from '@/hooks/use-saved-shows';
import { apiFetch, setToken } from '@/hooks/apiFetch';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface WelcomePageProps {
  onAuthenticated?: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onAuthenticated }) => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<FamilyUser | null>(null);
  const [error, setError] = useState<string>('');
  const [balls, setBalls] = useState<Ball[]>([]);

  useEffect(() => {
    const colors = ['#8b5cf6', '#ec4899', '#f97316', '#6366f1', '#f59e0b'];
    const initialBalls: Ball[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: 30 + Math.random() * 50,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setBalls(initialBalls);

    const animate = () => {
      setBalls(prevBalls =>
        prevBalls.map(ball => {
          let newX = ball.x + ball.vx;
          let newY = ball.y + ball.vy;
          let newVx = ball.vx;
          let newVy = ball.vy;

          if (newX <= 0 || newX >= window.innerWidth - ball.size) {
            newVx = -ball.vx;
            newX = newX <= 0 ? 0 : window.innerWidth - ball.size;
          }
          if (newY <= 0 || newY >= window.innerHeight - ball.size) {
            newVy = -ball.vy;
            newY = newY <= 0 ? 0 : window.innerHeight - ball.size;
          }

          return { ...ball, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  const handleUserSelect = async (user: FamilyUser) => {
    setError('');
    setSelectedUser(user);
    try {
      const res = await apiFetch('/api/auth/select-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to select user.');
        setSelectedUser(null);
        return;
      }
      setToken(data.token);
      if (onAuthenticated) onAuthenticated();
      navigate('/main', { replace: true });
    } catch {
      setError('Could not reach the server.');
      setSelectedUser(null);
    }
  };

  return (
    <div className="welcome">
      {balls.map(ball => (
        <div
          key={ball.id}
          className="welcome-ball"
          style={{
            left: `${ball.x}px`,
            top: `${ball.y}px`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            backgroundColor: ball.color,
          }}
        />
      ))}

      <div className="welcome-panel">
        <Card>
          <CardHeader>
            <div className="welcome-icon">
                <Sparkles />
              </div>
            <CardTitle className="welcome-title">
              Ni Hao
            </CardTitle>
            <CardDescription className="welcome-desc">
              Pick your profile
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="form-stack">
              <div>
                <Label>Who's watching?</Label>
                <div className="user-grid">
                  {FAMILY_USERS.map((user) => (
                    <button
                      key={user}
                      type="button"
                      className={`user-choice${selectedUser === user ? ' user-choice-active' : ''}`}
                      onClick={() => handleUserSelect(user)}
                      disabled={selectedUser !== null}
                    >
                      <UserRound />
                      <span>{user}</span>
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="error-box">{error}</div>}
            </div>
          </CardContent>
        </Card>
      
      </div>
    </div>
  );
};

export default WelcomePage;
