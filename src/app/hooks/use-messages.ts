import { useCallback, useEffect, useState } from "react";
import { api } from "../api/config";
import {
  ConversationInterface,
  DirectMessageInterface,
} from "../interfaces/message";
import { getSocket } from "../lib/socket";

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationInterface[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/messages/conversations");
      setConversations(response.data);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Tempo real: sempre que chega uma mensagem nova de qualquer conversa,
  // refaz a lista para atualizar a última mensagem/contagem de não lidas.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = () => fetchConversations();
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<DirectMessageInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const response = await api.get(
        `/messages/conversations/${conversationId}`,
      );
      setMessages(response.data.items || []);
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (payload: DirectMessageInterface) => {
      if (payload.conversationId === conversationId) {
        setMessages((prev) =>
          prev.some((m) => m.id === payload.id) ? prev : [...prev, payload],
        );
      }
    };
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [conversationId]);

  const sendMessage = async (recipientId: string, text: string) => {
    const response = await api.post(`/messages/${recipientId}`, { text });
    const newMessage = response.data.data;
    setMessages((prev) =>
      prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage],
    );
    return response.data;
  };

  const markAsRead = async () => {
    if (!conversationId) return;
    try {
      await api.patch(`/messages/conversations/${conversationId}/read`);
    } catch (err) {
      console.error("Erro ao marcar conversa como lida:", err);
    }
  };

  return { messages, loading, error, sendMessage, markAsRead, refetch: fetchMessages };
}
