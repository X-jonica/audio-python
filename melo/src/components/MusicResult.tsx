import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  MusicNote,
  Person,
  Album,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MusicResult as MusicResultType } from '../services/api';

interface MusicResultProps {
  result: MusicResultType;
}

const MusicResult: React.FC<MusicResultProps> = ({ result }) => {
  const confidenceColor = 
    result.confidence >= 0.9 ? 'success' : 
    result.confidence >= 0.7 ? 'warning' : 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ maxWidth: 500, mx: 'auto' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <MusicNote sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
            <Typography variant="h5" component="h2">
              Correspondance trouvée !
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              {result.title}
            </Typography>
            
            <Box display="flex" alignItems="center" mb={1}>
              <Person sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
              <Typography variant="h6" color="text.secondary">
                {result.artist}
              </Typography>
            </Box>
            
            {result.album && (
              <Box display="flex" alignItems="center" mb={2}>
                <Album sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                <Typography variant="body1" color="text.secondary">
                  {result.album}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ color: confidenceColor + '.main', mr: 1, fontSize: 20 }} />
              <Chip
                label={`${Math.round(result.confidence * 100)}% de confiance`}
                color={confidenceColor as any}
                variant="outlined"
                size="small"
              />
            </Box>
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
                  backgroundColor: 'background.default',
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
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