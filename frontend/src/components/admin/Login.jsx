import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // Static credentials
    const STATIC_USERNAME = 'Satish';
    const STATIC_PIN = '0209';

    if (username === STATIC_USERNAME && pin === STATIC_PIN) {
      // Store authentication in localStorage
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_username', username);
      toast.success('Login successful!');
      navigate('/admin');
    } else {
      toast.error('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-navy-900">TriMurti Gems</h1>
          <p className="text-gray-500">Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="w-full"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
              PIN
            </label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              required
              maxLength={4}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-lg"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Authorized access only</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
