import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useMemo,
    useCallback,
} from "react";
import axios from "axios";

export interface User {
    id: string;
    email: string;
    name: string;
    audd_key: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${storedToken}`;
            } catch (err) {
                console.error("Erreur de parsing JSON du user:", err);
                localStorage.removeItem("user");
            }
        }

        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            try {
                const response = await axios.post(`${API_URL}/api/login`, {
                    email,
                    password,
                });

                const { token: newToken, user: newUser } = response.data;

                if (!newToken || !newUser) {
                    console.error("Token ou user manquant dans la réponse !");
                    return;
                }

                setToken(newToken);
                setUser(newUser);
                localStorage.setItem("token", newToken);
                localStorage.setItem("user", JSON.stringify(newUser));

                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${newToken}`;
            } catch (error) {
                console.error("Erreur lors de la connexion :", error);
            }
        },
        []
    );

    const logout = useCallback((): void => {
        const confirmation = globalThis.confirm(
            "Confirmez votre déconnexion !"
        );
        if (confirmation) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete axios.defaults.headers.common["Authorization"];
        }
    }, []);

    const contextValue = useMemo(
        () => ({ user, token, login, logout, isLoading }),
        [user, token, login, logout, isLoading]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
