import { useEffect, useState, useCallback } from "react";
import { api } from "../api/config";
import { MoodTrackerResponse } from "../interfaces/mood";

export default function useMoodTracker() {
  const [data, setData] = useState<MoodTrackerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodTracker = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/ai/mood-tracker");
      if (response.status === 200) {
        setData(response.data);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao buscar diário emocional:", err);
      setError(
        err?.response?.data?.error || "Não foi possível carregar o teu diário emocional.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoodTracker();
  }, [fetchMoodTracker]);

  return { data, loading, error, refetch: fetchMoodTracker };
}
