import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { type User, getUserMe } from '../api/userService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the "Provider" component. This component will wrap our entire app.
//    It holds the actual state and logic.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const validateTokenAndFetchUser = async () => {
      const storedToken = localStorage.getItem("accessToken");

      if (storedToken) {
        try {
          const userData = await getUserMe(storedToken);
          setUser(userData);
          setToken(storedToken);

        } catch (error) {
          console.error("Token validation failed: ", error);
          localStorage.removeItem("accessToken")

          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    validateTokenAndFetchUser();
  }, [])

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);

    console.log(userData)
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
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
