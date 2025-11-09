import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Divider,
    CircularProgress,
    Alert,
} from "@mui/material";
import { Delete, MusicNote, History } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { apiService, HistoryItem } from "../services/api";
import { useAuth } from "../hooks/useAuth";

interface SearchHistoryProps {
    refreshTrigger?: number;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ refreshTrigger }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getSearchHistory(Number(user.id));
            setHistory(data);
            console.log("🔍 Utilisateur dans SearchHistory :", user);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Échec du chargement de l'historique"
            );
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [refreshTrigger, user, fetchHistory]);

    const handleDelete = async (id: number) => {
        console.log("🧩 ID envoyé pour suppression :", id);
        try {
            await apiService.deleteHistoryItem(id);
            setHistory((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Échec de la suppression"
            );
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return (
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        py={4}
                    >
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: "fit-content" }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <History sx={{ color: "primary.main", mr: 1 }} />
                    <Typography variant="h6">
                        Historique des recherches
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {history.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <MusicNote
                            sx={{
                                fontSize: 48,
                                color: "text.secondary",
                                mb: 1,
                            }}
                        />
                        <Typography variant="body1" color="text.secondary">
                            Aucune recherche pour le moment
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Commencez à identifier de la musique pour voir votre
                            historique ici
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        <AnimatePresence>
                            {history.map((item, index) => {
                                let confidenceColor = "error";
                                if (item.confidence >= 0.9) {
                                    confidenceColor = "success";
                                } else if (item.confidence >= 0.7) {
                                    confidenceColor = "warning";
                                }

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.1,
                                        }}
                                    >
                                        <ListItem
                                            sx={{
                                                px: 0,
                                                py: 1.5,
                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(255, 255, 255, 0.05)",
                                                    borderRadius: 1,
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="subtitle1"
                                                        noWrap
                                                    >
                                                        {item.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            noWrap
                                                        >
                                                            {item.artist}
                                                        </Typography>
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            gap={1}
                                                            mt={0.5}
                                                        >
                                                            <Chip
                                                                label={`${Math.round(
                                                                    item.confidence *
                                                                        100
                                                                )}%`}
                                                                size="small"
                                                                color={
                                                                    confidenceColor
                                                                }
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {formatDate(
                                                                    item.searchDate
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    color="error"
                                                    size="small"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < history.length - 1 && (
                                            <Divider />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default SearchHistory;
