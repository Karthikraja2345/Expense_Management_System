import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { login as apiLogin } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (name, password) => {
    try {
      const response = await apiLogin(name, password);
      const { token, user: userData } = response.data;

      // Sign in with custom token
      await signInWithCustomToken(auth, token);

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
