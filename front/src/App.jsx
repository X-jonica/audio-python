import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
   Container,
   Typography,
   Button,
   Card,
   CardContent,
   LinearProgress,
   Box,
   CircularProgress,
   keyframes,
   styled,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

// Création d'un composant stylisé sans le problème d'attribut DOM
const ListeningButton = styled(Button)(({ theme, islistening }) => ({
   animation:
      islistening === "true"
         ? `${keyframes`
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  `} 1.5s infinite`
         : "none",
   boxShadow:
      islistening === "true"
         ? `0 0 15px ${theme.palette.primary.main}`
         : "none",
   transition: "all 0.3s ease",
}));

function App() {
   const [listening, setListening] = useState(false);
   const [result, setResult] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [timer, setTimer] = useState(0);
   const audioContextRef = useRef(null);
   const analyserRef = useRef(null);
   const mediaStreamRef = useRef(null);
   const timerRef = useRef(null);
   const mediaRecorderRef = useRef(null);
   const audioChunksRef = useRef([]);

   useEffect(() => {
      return () => {
         // Cleanup on unmount
         if (timerRef.current) clearInterval(timerRef.current);
         stopRecording();
      };
   }, []);

   useEffect(() => {
      if (listening) {
         timerRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
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

   const stopRecording = () => {
      if (mediaStreamRef.current) {
         mediaStreamRef.current.getTracks().forEach((track) => track.stop());
         mediaStreamRef.current = null;
      }
      if (
         audioContextRef.current &&
         audioContextRef.current.state !== "closed"
      ) {
         audioContextRef.current.close();
      }
      if (
         mediaRecorderRef.current &&
         mediaRecorderRef.current.state !== "inactive"
      ) {
         mediaRecorderRef.current.stop();
      }
   };

   const handleStart = async () => {
      setError(null);
      try {
         const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
         });
         mediaStreamRef.current = stream;
         setListening(true);

         // Audio context setup for volume visualization
         const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
         audioContextRef.current = audioContext;
         const analyser = audioContext.createAnalyser();
         analyserRef.current = analyser;

         const source = audioContext.createMediaStreamSource(stream);
         source.connect(analyser);

         const data = new Uint8Array(analyser.frequencyBinCount);
         const updateVolume = () => {
            analyser.getByteFrequencyData(data);
            if (listening) requestAnimationFrame(updateVolume);
         };
         updateVolume();

         // Setup MediaRecorder for actual recording
         audioChunksRef.current = [];
         mediaRecorderRef.current = new MediaRecorder(stream);
         mediaRecorderRef.current.ondataavailable = (e) => {
            audioChunksRef.current.push(e.data);
         };
         mediaRecorderRef.current.start(100); // Collect data every 100ms
      } catch (err) {
         setError("Erreur d'accès au microphone: " + err.message);
         console.error(err);
      }
   };

   const handleStop = async () => {
      setListening(false);

      try {
         if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
         ) {
            mediaRecorderRef.current.stop();
         }

         // Wait for the recording to finish
         await new Promise((resolve) => {
            if (mediaRecorderRef.current) {
               mediaRecorderRef.current.onstop = resolve;
            } else {
               resolve();
            }
         });

         setLoading(true);
         setError(null);

         if (audioChunksRef.current.length === 0) {
            throw new Error("Aucun audio enregistré");
         }

         const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
         });
         const formData = new FormData();
         formData.append("audio", audioBlob, "recording.webm");

         const response = await axios.post(
            "http://127.0.0.1:8000/api/recognize",
            formData,
            {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
            }
         );

         setResult(response.data);
      } catch (err) {
         console.error("Erreur lors de l'envoi de l'audio :", err);
         setError(
            err.response?.data?.error || err.message || "Erreur inconnue"
         );
      } finally {
         setLoading(false);
         stopRecording();
      }
   };

   return (
      <Container
         maxWidth="sm"
         sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
         }}
      >
         <Typography
            variant="h3"
            gutterBottom
            sx={{
               fontWeight: 700,
               color: "primary.main",
               mb: 4,
               textAlign: "center",
            }}
         >
            Reconnaissance Musicale
         </Typography>

         {error && (
            <Box
               sx={{
                  color: "error.main",
                  bgcolor: "background.paper",
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  width: "100%",
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: "error.main",
               }}
            >
               <Typography>{error}</Typography>
            </Box>
         )}

         <Box
            sx={{
               display: "flex",
               gap: 2,
               mb: 4,
               width: "100%",
               justifyContent: "center",
            }}
         >
            <ListeningButton
               variant="contained"
               size="large"
               startIcon={<MicIcon />}
               onClick={handleStart}
               disabled={listening}
               islistening={listening.toString()}
               sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
               }}
            >
               Démarrer l'écoute
            </ListeningButton>

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
                  fontSize: "1.1rem",
               }}
            >
               Arrêter
            </Button>
         </Box>

         {listening && (
            <Box
               sx={{
                  width: "100%",
                  maxWidth: 400,
                  mb: 4,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow: 2,
               }}
            >
               <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  Écoute en cours... {15 - timer}s restantes
               </Typography>
               <LinearProgress
                  variant="determinate"
                  value={(timer / 15) * 100}
                  sx={{
                     height: 10,
                     borderRadius: 5,
                     "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        background:
                           "linear-gradient(90deg, #1976d2 0%, #4dabf5 100%)",
                     },
                  }}
               />
            </Box>
         )}

         {loading && (
            <Box
               sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  my: 4,
               }}
            >
               <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
               <Typography>Analyse en cours...</Typography>
            </Box>
         )}

         {result && (
            <Card
               sx={{
                  width: "100%",
                  mt: 4,
                  boxShadow: 3,
                  borderLeft: "4px solid",
                  borderColor: "primary.main",
               }}
            >
               <CardContent>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                     {result.title || "Titre inconnu"}
                  </Typography>
                  <Typography
                     variant="h6"
                     color="text.secondary"
                     sx={{ mb: 3 }}
                  >
                     {result.artist || "Artiste inconnu"}
                  </Typography>

                  {result.youtube_url && (
                     <Button
                        variant="contained"
                        color="secondary"
                        href={result.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ mb: 3 }}
                     >
                        Écouter la musique
                     </Button>
                  )}

                  {result.lyrics && (
                     <Box
                        sx={{
                           mt: 2,
                           p: 2,
                           bgcolor: "background.default",
                           borderRadius: 1,
                        }}
                     >
                        <Typography variant="subtitle2" gutterBottom>
                           Paroles:
                        </Typography>
                        <Typography
                           variant="body1"
                           sx={{ whiteSpace: "pre-wrap" }}
                        >
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
