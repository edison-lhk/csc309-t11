import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/*
 * This provider should export a `user` context state that is
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/user/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  /*
   * Logout the currently authenticated user.
   *
   * @remarks This function will always navigate to "/".
   */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  /**
   * Login a user with their credentials.
   *
   * @remarks Upon success, navigates to "/profile".
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {string} - Upon failure, Returns an error message.
   */
  const login = async (username, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.message;
      }

      localStorage.setItem("token", data.token);

      const userResponse = await fetch(`${BACKEND_URL}/user/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("token");
        return userData.message;
      }

      setUser(userData.user);
      navigate("/profile");
      return null;
    } catch (error) {
      return "Something went wrong";
    }
  };

  /**
   * Registers a new user.
   *
   * @remarks Upon success, navigates to "/success".
   * @param {Object} userData - The data of the user to register.
   * @returns {string} - Upon failure, returns an error message.
   */
  const register = async (userData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.message;
      }

      navigate("/success");
      return null;
    } catch (error) {
      return "Something went wrong";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
