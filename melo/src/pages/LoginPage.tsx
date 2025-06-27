import React, { useEffect, useState } from "react";
import {
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Link,
} from "@mui/material";
import { Login } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { user, login } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(email, password);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                navigate("/dashboard");
            }, 2000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Échec de la connexion"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Arrière-plan décoratif */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
            radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
          `,
                }}
            />

            <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Box textAlign="center" mb={4}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Login
                                        sx={{
                                            fontSize: 48,
                                            color: "primary.main",
                                            mb: 2,
                                        }}
                                    />
                                </motion.div>
                                <Typography
                                    variant="h4"
                                    component="h1"
                                    gutterBottom
                                >
                                    Bienvenue
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    Connectez-vous pour accéder à votre
                                    historique musical
                                </Typography>
                            </Box>

                            {success && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Connexion réussie ! Redirection en cours...
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    margin="normal"
                                    required
                                    autoFocus
                                />
                                <TextField
                                    fullWidth
                                    label="Mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    margin="normal"
                                    required
                                />

                                {error && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{ mt: 3, mb: 2, height: 48 }}
                                >
                                    {loading
                                        ? "Connexion en cours..."
                                        : "Se connecter"}
                                </Button>
                            </form>

                            <Box textAlign="center" mt={3}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Pas de compte ?{" "}
                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={() => navigate("/register")}
                                        sx={{ color: "primary.main" }}
                                    >
                                        Inscrivez-vous ici
                                    </Link>
                                </Typography>
                            </Box>

                            <Box textAlign="center" mt={2}>
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate("/")}
                                    sx={{ color: "text.secondary" }}
                                >
                                    ← Retour à l'accueil
                                </Link>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LoginPage;
