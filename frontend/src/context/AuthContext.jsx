import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
          const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, config);
          setUser({ ...data, token });
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Login successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, { name, email, password });
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Registration successful');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  const toggleFavorite = async (itemId, itemType) => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      
      const isFav = user.favorites.some(f => f.itemId === itemId);
      
      if (isFav) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/favorites/${itemId}`, config);
        setUser(prev => ({
            ...prev,
            favorites: prev.favorites.filter(f => f.itemId !== itemId)
        }));
        toast.success("Removed from favorites");
      } else {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/favorites`, { itemId, itemType }, config);
        setUser(prev => ({
            ...prev,
            favorites: data
        }));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update favorites");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
};
