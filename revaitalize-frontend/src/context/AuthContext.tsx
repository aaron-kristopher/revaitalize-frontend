import { createContext, useState, useContext, type ReactNode } from 'react';
import { type User } from '../api/userService';

// 1. Define the shape of the data that our context will hold
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// 2. Create the actual context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the "Provider" component. This component will wrap our entire app.
//    It holds the actual state and logic.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    // In a real app, you'd also save the token to localStorage here
    // to keep the user logged in across page refreshes.
    localStorage.setItem('accessToken', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    // Here you would redirect to the login page
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user, // Turns user object into true/false
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Create a custom hook. This is the easy way for our components
//    to get access to the auth data without messy syntax.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
