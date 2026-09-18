import React, {
    createContext,
    useState,
    useContext,
    useEffect
} from "react";

import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null);

    // ==========================================
    // CARGAR USUARIO GUARDADO
    // ==========================================

    useEffect(() => {

        const usuarioGuardado =
            localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            setUsuario(null);
            return;
        }

        try {

            const usuarioParseado =
                JSON.parse(usuarioGuardado);

            console.log(
                "USUARIO CARGADO DESDE LOCALSTORAGE:",
                usuarioParseado
            );

            setUsuario(usuarioParseado);

        } catch (error) {

            console.error(
                "Error al leer usuario:",
                error
            );

            localStorage.removeItem("usuario");
            localStorage.removeItem("token");

            setUsuario(null);
        }

    }, []);

    // ==========================================
    // LOGIN
    // ==========================================

    const login = (datosUsuario) => {

        console.log(
            "GUARDANDO USUARIO EN AUTHCONTEXT:",
            datosUsuario
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(datosUsuario)
        );

        setUsuario(datosUsuario);
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("usuario");
        localStorage.removeItem("token");

        setUsuario(null);

        navigate("/", {
            replace: true
        });
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    return useContext(AuthContext);

}