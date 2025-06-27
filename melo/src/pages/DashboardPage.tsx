import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Typography,
    Box,
    AppBar,
    Toolbar,
    Button,
    Alert,
    Paper,
} from "@mui/material";
import { Logout, MusicNote } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import AudioRecorder from "../components/AudioRecorder";
import MusicResult from "../components/MusicResult";
import SearchHistory from "../components/SearchHistory";
import { MusicResult as MusicResultType } from "../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardPage: React.FC = () => {
    const [result, setResult] = useState<MusicResultType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [historyRefresh, setHistoryRefresh] = useState(0);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    });

    const handleResult = (newResult: MusicResultType) => {
        setResult(newResult);
        setError(null);
        setHistoryRefresh((prev) => prev + 1);
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setResult(null);
    };

    const handleNewSearch = () => {
        setResult(null);
        setError(null);
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{ backgroundColor: "background.paper" }}
            >
                <Toolbar>
                    <Box display="flex" alignItems="center" flexGrow={1}>
                        <MusicNote sx={{ color: "primary.main", mr: 1 }} />
                        <Typography variant="h6" component="div">
                            SoundWave
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        Bonjour, {user?.name}
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<Logout />}
                        onClick={logout}
                    >
                        Déconnexion
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        textAlign="center"
                    >
                        Tableau de bord musical
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        mb={4}
                    >
                        Découvrez et enregistrez vos musiques préférées
                    </Typography>
                </motion.div>

                <Grid container spacing={4}>
                    {/* Colonne de gauche - Reconnaissance musicale */}
                    <Grid item xs={12} lg={8}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    background:
                                        "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: 3,
                                    minHeight: 400,
                                }}
                            >
                                {!result && !error && (
                                    <Box textAlign="center">
                                        <Typography variant="h5" gutterBottom>
                                            Identifier une musique
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            mb={4}
                                        >
                                            Cliquez sur le bouton ci-dessous et
                                            laissez-nous écouter pendant 20
                                            secondes
                                        </Typography>
                                        <AudioRecorder
                                            onResult={handleResult}
                                            onError={handleError}
                                        />
                                    </Box>
                                )}

                                {error && (
                                    <Box textAlign="center">
                                        <Alert severity="error" sx={{ mb: 3 }}>
                                            {error}
                                        </Alert>
                                        <Button
                                            variant="outlined"
                                            onClick={handleNewSearch}
                                        >
                                            Réessayer
                                        </Button>
                                    </Box>
                                )}

                                {result && (
                                    <Box>
                                        <MusicResult result={result} />

                                        <Box textAlign="center" mt={2}>
                                            <Button
                                                variant="outlined"
                                                onClick={async () => {
                                                    if (!user) return;

                                                    try {
                                                        const response =
                                                            await axios
                                                                .post(
                                                                    "http://localhost:8000/api/history",
                                                                    {
                                                                        title: `${result.artist} - ${result.title}`,
                                                                        paroles:
                                                                            result.lyrics ||
                                                                            "Paroles non disponibles",
                                                                        user_id:
                                                                            user.id,
                                                                    }
                                                                )
                                                                .then(
                                                                    (
                                                                        response
                                                                    ) =>
                                                                        console.log(
                                                                            response
                                                                        )
                                                                )
                                                                .catch(
                                                                    (error) =>
                                                                        console.error(
                                                                            error
                                                                        )
                                                                );

                                                        alert(
                                                            "Sauvegarde réussie !"
                                                        );
                                                        setHistoryRefresh(
                                                            (prev) => prev + 1
                                                        );
                                                    } catch (err) {
                                                        console.error(
                                                            "Erreur de sauvegarde :",
                                                            err
                                                        );
                                                        alert(
                                                            "Erreur lors de la sauvegarde."
                                                        );
                                                    }
                                                }}
                                                size="large"
                                                sx={{ mr: 2 }}
                                            >
                                                Sauvegarder
                                            </Button>

                                            <Button
                                                variant="contained"
                                                onClick={handleNewSearch}
                                                size="large"
                                            >
                                                Nouvelle recherche
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>
                        </motion.div>
                    </Grid>

                    {/* Colonne de droite - Historique des recherches */}
                    <Grid item xs={12} lg={4}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <SearchHistory refreshTrigger={historyRefresh} />
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default DashboardPage;
