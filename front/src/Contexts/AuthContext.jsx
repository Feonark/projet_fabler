import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refresh_token");
    if (storedToken) setToken(storedToken);
    if (storedRefresh) setRefreshToken(storedRefresh);
  }, []);

  useEffect(() => {
    if (token && refreshToken) {
      getUser();
    }
  }, [token, refreshToken]);

  const getUser = async () => {
    if (!token) {
      setUser("GUEST");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 && refreshToken) {
        const newToken = await refresh();
        if (newToken) {
          return getUser(); // réessaye avec le nouveau token
        }
        return;
      }

      if (!response.ok) {
        throw new Error("User not found.");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.log(err);
    }
  };

  const login = ({ token: newToken, refresh_token }) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("refresh_token", refresh_token);
    setToken(newToken);
    setRefreshToken(refresh_token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setRefreshToken(null);
    setUser("GUEST");
  };

  const refresh = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/token/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh failed.");

      const data = await res.json();

      localStorage.setItem("token", data.token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
        setRefreshToken(data.refresh_token);
      }

      setToken(data.token);
      return data.token;
    } catch (err) {
      console.log("Refresh failed, logging out.");
      logout();
      return null;
    }
  };

  const isAuthenticated = token ? true : false;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        refreshToken,
        isAuthenticated,
        getUser,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
