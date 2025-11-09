import { useState } from "react";
import {
    Typography,
    Box,
    Button,
    Modal,
    TextField,
    CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const AuddKeyModal = ({
    open,
    onClose,
    auddKey,
    setAuddKey,
}: {
    open: boolean;
    onClose: () => void;
    auddKey: string;
    setAuddKey: (key: string) => void;
}) => {
    const [inputKey, setInputKey] = useState(auddKey || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!inputKey) {
            setError("La clé AUDD est requise");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_URL}/api/set-audd-key`,
                { audd_key: inputKey },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                setAuddKey(inputKey);
                onClose();
            }
        } catch (err: any) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                    "Erreur lors de la vérification de la clé"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    p: 4,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Mettre à jour votre clé AUDD
                </Typography>
                <TextField
                    label="Clé AUDD"
                    fullWidth
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    error={!!error}
                    helperText={error}
                />
                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                    <Button onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            "Enregistrer"
                        )}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AuddKeyModal;
