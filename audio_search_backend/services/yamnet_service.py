import tensorflow_hub as hub
import tensorflow as tf
import pandas as pd
import librosa

yamnet_model = None
class_names = None

def get_yamnet_model():
    global yamnet_model, class_names
    if yamnet_model is None or class_names is None:
        yamnet_model = hub.load('https://tfhub.dev/google/yamnet/1')
        class_map_path = tf.keras.utils.get_file(
            'yamnet_class_map.csv',
            'https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv'
        )
        class_names = pd.read_csv(class_map_path)['display_name'].tolist()
    return yamnet_model, class_names

def analyze_audio_yamnet(file_path):
    try:
        waveform, sr = librosa.load(file_path, sr=16000, mono=True)
        model, class_names = get_yamnet_model()
        scores = model(waveform)
        mean_scores = tf.reduce_mean(scores, axis=0)
        top_indices = tf.argsort(mean_scores, direction='DESCENDING')[:5]

        return [{"label": class_names[i], "score": float(mean_scores[i])} for i in top_indices]
    except Exception as e:
        print("Erreur YAMNet:", e)
        return []
