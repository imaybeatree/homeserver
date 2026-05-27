import React, { useState, useEffect } from 'react';
import { Sparkles, UserRound } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { FAMILY_USERS, type FamilyUser } from '@/hooks/use-saved-shows';

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
  const [selectedUser, setSelectedUser] = useState<FamilyUser | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
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

  const handleUserSelect = (user: FamilyUser) => {
    setError('');
    setSelectedUser(user);

    setSubmitted(true);

    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('currentUser', user);
    
    if (onAuthenticated) {
      setTimeout(() => onAuthenticated(), 2000);
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
              {!submitted 
                ? "Pick your profile"
                : "donezos"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!submitted ? (
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
                      >
                        <UserRound />
                        <span>{user}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="error-box">
                    {error}
                  </div>
                )}

              </div>
            ) : (<Navigate to="/main" replace />)}
          </CardContent>
        </Card>
      
      </div>
    </div>
  );
};

export default WelcomePage;
