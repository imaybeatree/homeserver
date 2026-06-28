import React, { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '@/hooks/backendUrl';
import { setToken } from '@/hooks/apiFetch';

const backend = getBackendUrl();

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const AccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('appUnlocked') === 'true') {
      navigate('/select', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const colors = ['#8b5cf6', '#ec4899', '#f97316', '#6366f1', '#f59e0b'];
    const initialBalls: Ball[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: 30 + Math.random() * 50,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setBalls(initialBalls);

    const interval = setInterval(() => {
      setBalls(prev =>
        prev.map(ball => {
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
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer when locked out
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown('');
        setError('');
        setAttemptsLeft(null);
        inputRef.current?.focus();
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil && Date.now() < lockedUntil) return;

    const sanitized = password.trim().slice(0, 256).replace(/[^\x20-\x7E]/g, '');
    if (!sanitized) {
      setError('Please enter a password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${backend}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: sanitized }),
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        sessionStorage.setItem('appUnlocked', 'true');
        navigate('/select', { replace: true });
        return;
      }

      if (res.status === 429) {
        setLockedUntil(data.lockedUntil);
        setAttemptsLeft(0);
        setError('Too many failed attempts.');
        setPassword('');
        return;
      }

      setAttemptsLeft(data.attemptsLeft ?? null);
      setError('Incorrect password.');
      setPassword('');
      inputRef.current?.focus();
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

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
              <Lock />
            </div>
            <CardTitle className="welcome-title">Access Required</CardTitle>
            <CardDescription className="welcome-desc">
              {isLocked ? `Locked — try again in ${countdown}` : 'Enter the password to continue'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="form-stack">
              <Input
                ref={inputRef}
                type="password"
                placeholder="Password"
                value={password}
                maxLength={256}
                autoComplete="current-password"
                disabled={isLocked || isSubmitting}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />

              {error && (
                <div className="error-box">
                  {error}
                  {attemptsLeft !== null && attemptsLeft > 0 && (
                    <span> {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining.</span>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="tv-button-wide"
                disabled={isLocked || isSubmitting || !password}
              >
                {isSubmitting ? 'Checking…' : 'Enter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessPage;
