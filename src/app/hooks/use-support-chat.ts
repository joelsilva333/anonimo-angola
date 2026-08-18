import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "../interfaces/chat";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSupportChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const res = await fetch("/api/support/history", {
          credentials: "include",
        });

        if (res.status === 404) {
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;

        const loaded: ChatMessage[] = (data.messages ?? []).map(
          (m: { role: string; content: string; createdAt: string }) => ({
            id: createId(),
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: new Date(m.createdAt).getTime(),
          }),
        );

        setMessages(loaded);
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const assistantId = createId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const historyForApi = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setSending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForApi }),
          signal: controller.signal,
          credentials: "include",
        });

        if (!response.ok || !response.body) {
          const data = await response.json().catch(() => null);
          throw new Error(
            data?.error || "Erro ao contactar o apoio emocional.",
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunkText }
                : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const message =
          err instanceof Error
            ? err.message
            : "Erro inesperado. Tenta novamente.";
        setError(message);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setSending(false);
        abortRef.current = null;
      }
    },
    [messages, sending],
  );

  const reset = useCallback(async () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setSending(false);

    try {
      await fetch("/api/support/conversation", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
    }
  }, []);

  return { messages, sendMessage, sending, loading, error, reset };
}
