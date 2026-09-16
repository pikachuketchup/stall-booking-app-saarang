import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('box_app_username') || '';
  });

  const [selectedBoxes, setSelectedBoxes] = useState([]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('box_app_username', username);
    } else {
      localStorage.removeItem('box_app_username');
    }
  }, [username]);

  const login = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Username cannot be empty');

    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: trimmed }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to login');
    }

    setUsername(trimmed);
    setSelectedBoxes([]);
    return data.user;
  };

  const logout = () => {
    setUsername('');
    setSelectedBoxes([]);
    localStorage.removeItem('box_app_username');
  };

  const toggleBoxSelection = (boxId) => {
    setSelectedBoxes((prev) =>
      prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
    );
  };

  const clearSelection = () => {
    setSelectedBoxes([]);
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        setUsername,
        login,
        logout,
        selectedBoxes,
        setSelectedBoxes,
        toggleBoxSelection,
        clearSelection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
