import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    LinearProgress,
    IconButton,
} from "@mui/material";
import { Mic, MicOff, MusicNote, ContentCopy } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { MusicResult } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface AudioRecorderProps {
    onResult: (result: MusicResult) => void;
    onError: (error: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onResult, onError }) => {
    const { isRecording, startRecording, stopRecording, recordingTime } =
        useAudioRecorder();
    const [isSearching, setIsSearching] = useState(false);
    const [recordingProgress, setRecordingProgress] = useState(0);
    const [lyrics, setLyrics] = useState("");
    const { user } = useAuth();

    const RECORDING_DURATION = 20; // 20 secondes

    useEffect(() => {
        if (isRecording) {
            setRecordingProgress((recordingTime / RECORDING_DURATION) * 100);

            if (recordingTime >= RECORDING_DURATION) {
                handleStopRecording();
            }
        }
    }, [recordingTime, isRecording]);

    const handleCopyLyrics = () => {
        navigator.clipboard.writeText(lyrics);
    };

    const handleStartRecording = async () => {
        try {
            await startRecording();
        } catch (error) {
            onError(
                error instanceof Error
                    ? error.message
                    : "Échec du démarrage de l'enregistrement"
            );
        }
    };

    const handleStopRecording = async () => {
        try {
            setIsSearching(true);
            const audioBlob = await stopRecording();

            if (!audioBlob) {
                throw new Error("Échec de l'enregistrement audio.");
            }

            const formData = new FormData();
            formData.append("audio", audioBlob);

            let response;
            if (user) {
                formData.append("user_id", user.id);
                response = await fetch("http://localhost:8000/api/recognize", {
                    method: "POST",
                    body: formData,
                });
            } else {
                response = await fetch("http://localhost:8000/api/search", {
                    method: "POST",
                    body: formData,
                });
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Échec de l'identification");
            }

            setLyrics(result.lyrics || "");
            onResult(result);
        } catch (error) {
            onError(error instanceof Error ? error.message : "Erreur inconnue");
        } finally {
            setIsSearching(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
            <AnimatePresence mode="wait">
                {!isRecording && !isSearching && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Mic />}
                            onClick={handleStartRecording}
                            sx={{
                                minWidth: 200,
                                height: 60,
                                fontSize: "1.1rem",
                                background:
                                    "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
                                "&:hover": {
                                    background:
                                        "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
                                    transform: "translateY(-2px)",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            Démarrer l'écoute
                        </Button>
                    </motion.div>
                )}

                {isRecording && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card sx={{ minWidth: 300, textAlign: "center" }}>
                            <CardContent>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={2}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                        }}
                                    >
                                        <Mic
                                            sx={{
                                                fontSize: 40,
                                                color: "error.main",
                                                mr: 1,
                                            }}
                                        />
                                    </motion.div>
                                    <Typography variant="h6" color="error">
                                        Enregistrement en cours...
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="h4"
                                    sx={{ mb: 2, fontFamily: "monospace" }}
                                >
                                    {formatTime(recordingTime)}
                                </Typography>

                                <LinearProgress
                                    variant="determinate"
                                    value={recordingProgress}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        mb: 2,
                                        "& .MuiLinearProgress-bar": {
                                            background:
                                                "linear-gradient(90deg, #6366f1, #ec4899)",
                                        },
                                    }}
                                />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    {RECORDING_DURATION - recordingTime}{" "}
                                    secondes restantes
                                </Typography>

                                <Button
                                    variant="outlined"
                                    startIcon={<MicOff />}
                                    onClick={handleStopRecording}
                                    color="error"
                                >
                                    Arrêter
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {isSearching && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card sx={{ minWidth: 300, textAlign: "center" }}>
                            <CardContent>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    mb={2}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    >
                                        <MusicNote
                                            sx={{
                                                fontSize: 40,
                                                color: "primary.main",
                                                mr: 1,
                                            }}
                                        />
                                    </motion.div>
                                    <Typography variant="h6">
                                        Identification en cours...
                                    </Typography>
                                </Box>

                                <CircularProgress sx={{ mb: 2 }} />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Analyse de votre enregistrement
                                </Typography>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {lyrics && (
                <Box sx={{ position: "relative", width: "100%", mt: 2 }}>
                    <IconButton
                        onClick={handleCopyLyrics}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            zIndex: 1,
                        }}
                        title="Copier les paroles"
                    >
                        <ContentCopy />
                    </IconButton>
                    <Typography
                        variant="body1"
                        sx={{
                            p: 2,
                            border: "1px solid #ddd",
                            borderRadius: 1,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {lyrics}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AudioRecorder;
