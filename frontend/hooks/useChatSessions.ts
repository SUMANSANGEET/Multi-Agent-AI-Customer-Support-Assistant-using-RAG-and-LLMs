import { useState, useEffect } from 'react';
import { UserProfile, ChatSession, ChatMessage } from '../../src/types';

export function useChatSessions(user: UserProfile) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [user.id]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions?userId=${user.id}`);
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        setSessions(data.sessions);
        setActiveSessionId(data.sessions[0].id);
      }
    } catch (e) {
      console.warn('Hook error:', e);
    } finally {
      setLoading(false);
    }
  };

  return { sessions, activeSessionId, setActiveSessionId, loading, refreshSessions: fetchSessions };
}
