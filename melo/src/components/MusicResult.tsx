import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Divider,
    Paper,
    Link,
} from "@mui/material";
import {
    MusicNote,
    Person,
    Album,
    TrendingUp,
    PsychologyAlt,
    YouTube,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { MusicResult as MusicResultType } from "../services/api";

interface MusicResultProps {
    result: MusicResultType;
}

const MusicResult: React.FC<MusicResultProps> = ({ result }) => {
    const confidenceColor =
        result.confidence >= 0.9
            ? "success"
            : result.confidence >= 0.7
            ? "warning"
            : "error";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{ maxWidth: 500, mx: "auto" }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <MusicNote
                            sx={{ color: "primary.main", mr: 1, fontSize: 28 }}
                        />
                        <Typography variant="h5" component="h2">
                            Correspondance trouvée !
                        </Typography>
                    </Box>

                    <Box mb={3}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {result.title}
                        </Typography>

                        <Box display="flex" alignItems="center" mb={1}>
                            <Person
                                sx={{
                                    color: "text.secondary",
                                    mr: 1,
                                    fontSize: 20,
                                }}
                            />
                            <Typography variant="h6" color="text.secondary">
                                {result.artist}
                            </Typography>
                        </Box>

                        {result.album && (
                            <Box display="flex" alignItems="center" mb={2}>
                                <Album
                                    sx={{
                                        color: "text.secondary",
                                        mr: 1,
                                        fontSize: 20,
                                    }}
                                />
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                >
                                    {result.album}
                                </Typography>
                            </Box>
                        )}

                        {result.confidence !== undefined && (
                            <Box display="flex" alignItems="center" mb={1}>
                                <TrendingUp
                                    sx={{
                                        color: `${confidenceColor}.main`,
                                        mr: 1,
                                        fontSize: 20,
                                    }}
                                />
                                <Chip
                                    label={`${Math.round(
                                        result.confidence * 100
                                    )}% de confiance`}
                                    color={confidenceColor as any}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>
                        )}

                        {result.yamnet_prediction &&
                            Array.isArray(result.yamnet_prediction) && (
                                <Box mt={3} textAlign="left">
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        mb={1}
                                    >
                                        <PsychologyAlt
                                            sx={{
                                                color: "info.main",
                                                mr: 1,
                                                fontSize: 24,
                                            }}
                                        />
                                        <Typography
                                            variant="h6"
                                            color="info.main"
                                        >
                                            Prédictions IA (YAMNet)
                                        </Typography>
                                    </Box>

                                    <Box
                                        component="ul"
                                        sx={{
                                            pl: 3,
                                            listStyle: "disc",
                                            color: "text.secondary",
                                            fontSize: "0.95rem",
                                            textAlign: "left",
                                            m: 0,
                                        }}
                                    >
                                        {result.yamnet_prediction.map(
                                            (p, index) => (
                                                <li key={index}>
                                                    <Typography component="span">
                                                        <strong>
                                                            {p.label}
                                                        </strong>{" "}
                                                        —{" "}
                                                        {Math.round(
                                                            p.score * 100
                                                        )}
                                                        % de confiance
                                                    </Typography>
                                                </li>
                                            )
                                        )}
                                    </Box>
                                </Box>
                            )}

                        {/* ✅ Lien YouTube stylisé */}
                        {result.youtube_url && (
                            <Box
                                mt={3}
                                p={2}
                                borderRadius={2}
                                bgcolor="background.paper"
                                display="flex"
                                justifyContent="center" 
                                alignItems="center"
                                boxShadow={1}
                                border="1px solid"
                                borderColor="divider"
                                textAlign="center"
                                sx={{
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(255, 0, 0, 0.05)", 
                                    },
                                }}
                            >
                                <YouTube
                                    sx={{
                                        fontSize: 30,
                                        color: "error.main",
                                        mr: 1,
                                    }}
                                />
                                <Link
                                    href={result.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="hover"
                                    color="error.main"
                                    fontWeight={600}
                                    sx={{
                                        transition: "color 0.3s ease",
                                        "&:hover": {
                                            color: "error.dark",
                                        },
                                    }}
                                >
                                    Écouter la musique
                                </Link>
                            </Box>
                        )}
                    </Box>

                    {result.lyrics && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Extrait des paroles
                            </Typography>
                            <Paper
                                sx={{
                                    p: 2,
                                    backgroundColor: "background.default",
                                    maxHeight: 200,
                                    overflow: "auto",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    component="pre"
                                    sx={{
                                        whiteSpace: "pre-wrap",
                                        fontFamily: "inherit",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {result.lyrics}
                                </Typography>
                            </Paper>
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MusicResult;
