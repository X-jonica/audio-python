import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import axios from "axios";

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

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
                localStorage.removeItem("user"); // on nettoie pour éviter des bugs futurs
            }
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                { email, password }
            );

            console.log("Réponse de login:", response.data);

            const { token: newToken, user: newUser } = response.data;

            // Vérifie ici aussi avant de stocker
            if (!newToken || !newUser) {
                console.error("Token ou user manquant dans la réponse !");
                return;
            }

            setToken(newToken);
            setUser(newUser);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${newToken}`;
        } catch (error) {
            throw new Error("Login failed");
        }
    };

    const logout = (): void => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
