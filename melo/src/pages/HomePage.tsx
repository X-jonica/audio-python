import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import {
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AudioRecorder from '../components/AudioRecorder';
import MusicResult from '../components/MusicResult';
import { MusicResult as MusicResultType } from '../services/api';

const HomePage: React.FC = () => {
  const [result, setResult] = useState<MusicResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResult = (newResult: MusicResultType) => {
    setResult(newResult);
    setError(null);
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Éléments décoratifs d'arrière-plan */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          py={4}
        >
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box textAlign="center" mb={6}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  background: 'linear-gradient(45deg, #6366f1, #ec4899, #f59e0b)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                SoundWave
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                color="text.secondary"
                sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}
              >
                Découvrez la musique par le son
              </Typography>
            </Box>
          </motion.div>

          {/* Boutons d'authentification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box display="flex" gap={2} mb={6}>
              <Button
                variant="outlined"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{ minWidth: 120 }}
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{ minWidth: 120 }}
              >
                Inscription
              </Button>
            </Box>
          </motion.div>

          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ width: '100%', maxWidth: 600 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              {!result && !error && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Identifiez n'importe quelle chanson
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={4}>
                    Appuyez simplement sur le bouton et laissez-nous écouter pendant 20 secondes
                  </Typography>
                  <AudioRecorder onResult={handleResult} onError={handleError} />
                </Box>
              )}

              {error && (
                <Box>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                  <Button variant="outlined" onClick={handleNewSearch}>
                    Réessayer
                  </Button>
                </Box>
              )}

              {result && (
                <Box>
                  <MusicResult result={result} />
                  <Box mt={3}>
                    <Button
                      variant="contained"
                      onClick={handleNewSearch}
                      sx={{ mr: 2 }}
                    >
                      Nouvelle recherche
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/register')}
                    >
                      Sauvegarder
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Fonctionnalités */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Box mt={8} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Inscrivez-vous pour sauvegarder votre historique et accéder à des fonctionnalités avancées
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;