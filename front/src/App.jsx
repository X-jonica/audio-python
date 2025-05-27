import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Button, Card, CardContent, LinearProgress,
  Box, CircularProgress, keyframes, styled
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const PulseButton = styled(Button)(({ theme, listening }) => ({
  animation: listening ? `${keyframes`
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  `} 1.5s infinite` : 'none',
  boxShadow: listening ? `0 0 15px ${theme.palette.primary.main}` : 'none',
  transition: 'all 0.3s ease',
}));

function App() {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (listening) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }

    return () => clearInterval(timerRef.current);
  }, [listening]);

  useEffect(() => {
    if (timer >= 15 && listening) {
      handleStop();
    }
  }, [timer, listening]);

  const handleStart = async () => {
    setListening(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioRef.current = stream;

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const updateVolume = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setVolume(Math.min(100, Math.round(avg)));
      if (listening) requestAnimationFrame(updateVolume);
    };
    updateVolume();
  };

  const handleStop = async () => {
    setListening(false);
    if (audioRef.current) {
      audioRef.current.getTracks().forEach((track) => track.stop());
    }

    setLoading(true);
    try {
      // On envoie simplement une requête sans demande utilisateur
      const response = await axios.get(`http://localhost:8000/search?q=audio_sample`);
      setResult(response.data);
    } catch (err) {
      console.error("Erreur backend:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <Typography variant="h3" gutterBottom sx={{
        fontWeight: 700,
        color: 'primary.main',
        mb: 4,
        textAlign: 'center'
      }}>
        Reconnaissance Musicale
      </Typography>

      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 4,
        width: '100%',
        justifyContent: 'center'
      }}>
        <PulseButton
          variant="contained"
          size="large"
          startIcon={<MicIcon />}
          onClick={handleStart}
          disabled={listening}
          listening={listening}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem'
          }}
        >
          Démarrer l'écoute
        </PulseButton>

        <Button
          variant="outlined"
          color="secondary"
          size="large"
          startIcon={<StopIcon />}
          onClick={handleStop}
          disabled={!listening}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem'
          }}
        >
          Arrêter
        </Button>
      </Box>

      {listening && (
        <Box sx={{
          width: '100%',
          maxWidth: 400,
          mb: 4,
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 2
        }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
            Écoute en cours... {15 - timer}s restantes
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(timer / 15) * 100}
            sx={{
              height: 10,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #1976d2 0%, #4dabf5 100%)'
              }
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Volume détecté: {volume}%
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography>Analyse en cours...</Typography>
        </Box>
      )}

      {result && (
        <Card sx={{
          width: '100%',
          mt: 4,
          boxShadow: 3,
          borderLeft: '4px solid',
          borderColor: 'primary.main'
        }}>
          <CardContent>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {result.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {result.artist}
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              href={result.youtube_url}
              target="_blank"
              rel="noreferrer"
              sx={{ mb: 3 }}
            >
              Écouter sur YouTube
            </Button>

            {result.lyrics && (
              <Box sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}>
                <Typography variant="subtitle2" gutterBottom>
                  Paroles:
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result.lyrics}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default App;