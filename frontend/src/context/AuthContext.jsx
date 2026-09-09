import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Cargar datos del usuario desde localStorage al iniciar la app
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (datosUsuario) => {
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
    navigate("/"); // Redirige al login / inicio
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}