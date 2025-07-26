import axios from "axios";

const API_BASE_URL = "https://audio-python.onrender.com/api";

export interface GenrePrediction {
    label: string;
    score: number;
}

export interface MusicResult {
    id?: string;
    title: string;
    artist: string;
    album?: string;
    lyrics?: string;
    confidence: number;
    timestamp?: string;
    youtube_url?: string; 
    yamnet_prediction?: GenrePrediction[];
}


export interface HistoryItem {
    id: number;
    title: string;
    paroles: string;
    searchDate: string;
    confidence: number;
    artist?: string;
}

class ApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // GET /history/:user_id
    async getSearchHistory(userId: number): Promise<HistoryItem[]> {
        const response = await axios.get(`${this.baseURL}/history/${userId}`);
        return response.data.map((item: any, index: number) => ({
            id: index + 1,
            title: item.title,
            paroles: item.paroles,
            searchDate: item.date,
            confidence: 1.0,
        }));
    }

    // DELETE /history/:history_id
    async deleteHistoryItem(id: number): Promise<void> {
        await axios.delete(`${this.baseURL}/history/${id}`);
    }

    // POST /history
    async saveToHistory(result: MusicResult, userId: number): Promise<void> {
        const payload = {
            title: `${result.artist} - ${result.title}`,
            paroles: result.lyrics || "Paroles non disponibles",
            user_id: userId,
        };

        await axios.post(`${this.baseURL}/history`, payload);
    }
}

export const apiService = new ApiService();
