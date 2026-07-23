import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStoredUsers } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  users: User[];
  loginAs: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [currentUser, setCurrentUser] = useState<User>(users[0] || getStoredUsers()[0]);

  useEffect(() => {
    const loaded = getStoredUsers();
    setUsers(loaded);
  }, []);

  const loginAs = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const logout = () => {
    // Default back to first user or a guest mock
    if (users.length > 0) {
      setCurrentUser(users[0]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loginAs,
        logout,
        isAuthenticated: true,
        isAdmin: currentUser.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
