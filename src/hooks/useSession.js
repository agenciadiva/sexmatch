import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
      setSession(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  return { session, loading };
}

export function useAnswers(sessionId) {
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (!sessionId) return;
    const q = query(collection(db, 'answers'), where('sessionId', '==', sessionId));
    const unsub = onSnapshot(q, (snap) => {
      setAnswers(snap.docs.map((d) => d.data()));
    });
    return () => unsub();
  }, [sessionId]);

  return answers;
}
