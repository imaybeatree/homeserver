import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';

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
  const [password, setPassword] = useState<string>('');
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

  const handleSubmit = () => {
    setError('');
    
    // if (!name.trim()) {
    //   setError('Please enter your name');
    //   return;
    // }
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    

    if (password === '123') {
      setSubmitted(true);
      

      sessionStorage.setItem('isAuthenticated', 'true');
      // sessionStorage.setItem('userName', name);
      
      if (onAuthenticated) {
        setTimeout(() => onAuthenticated(), 2000);
      }
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="relative min-h-screen background flex items-center justify-center p-4 overflow-hidden">
      {balls.map(ball => (
        <div
          key={ball.id}
          className="absolute rounded-full pointer-events-none opacity-30 transition-all duration-[16ms] linear"
          style={{
            left: `${ball.x}px`,
            top: `${ball.y}px`,
            width: `${ball.size}px`,
            height: `${ball.size}px`,
            backgroundColor: ball.color,
          }}
        />
      ))}

      <div className="max-w-md w-full relative z-10">
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ni Hao
            </CardTitle>
            <CardDescription className="text-base">
              {!submitted 
                ? "Type the ting"
                : "donezos"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!submitted ? (
              <div className="space-y-4">
                {/* <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div> */}
                
                <div className="space-y-2">
                  <Label>The ting</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="type here"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                
                <Button
                  onClick={handleSubmit}
                  disabled={!password.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

              </div>
            ) : (<Navigate to="/main" replace />)}
          </CardContent>
        </Card>
        
        <p className="text-center text-white mt-6 text-sm">
          yea i vibe coded the balls xd
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;