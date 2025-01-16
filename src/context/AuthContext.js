"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// Create the Auth Context
const AuthContext = createContext();

// Create the provider to wrap around your app
export const AuthProvider = ({ children }) => {
  const router = useRouter();

  // Function to handle user login using Axios
  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          username,
          password,
        }
      );
      if (response.status === 201) {
        const data = response.data;
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error", error);
    }
  };
  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    router.push("/login"); // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
