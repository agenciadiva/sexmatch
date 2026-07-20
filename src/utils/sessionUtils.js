import { db } from '../firebase/config';
import {
  collection, doc, setDoc, updateDoc,
  query, where, getDocs, arrayUnion,
} from 'firebase/firestore';

function uid() {
  return Math.random().toString(36).substring(2, 15);
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createSession() {
  const code = generateCode();
  const userId = uid();
  const sessionRef = doc(collection(db, 'sessions'));

  await setDoc(sessionRef, {
    code,
    status: 'waiting',
    currentPhase: 'questions_1',
    users: [userId],
    completedBlock1: [],
    completedBlock2: [],
    createdAt: new Date(),
  });

  return { sessionId: sessionRef.id, userId, code };
}

export async function joinSession(code) {
  const q = query(collection(db, 'sessions'), where('code', '==', code.trim().toUpperCase()));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('Código inválido. Verificá con la otra persona.');

  const sessionDoc = snap.docs[0];
  const session = sessionDoc.data();

  if (session.users.length >= 2) throw new Error('Esta sesión ya tiene dos participantes.');

  const userId = uid();
  await updateDoc(sessionDoc.ref, {
    users: arrayUnion(userId),
    status: 'in_progress',
  });

  return { sessionId: sessionDoc.id, userId };
}

export async function submitAnswer(sessionId, userId, questionId, value) {
  const ref = doc(db, 'answers', `${sessionId}_${userId}_${questionId}`);
  await setDoc(ref, { sessionId, userId, questionId, value });
}

export async function markBlockCompleted(sessionId, userId, block) {
  const ref = doc(db, 'sessions', sessionId);
  const field = block === 1 ? 'completedBlock1' : 'completedBlock2';
  await updateDoc(ref, { [field]: arrayUnion(userId) });
}

export async function advancePhase(sessionId, phase) {
  await updateDoc(doc(db, 'sessions', sessionId), { currentPhase: phase });
}

export async function saveLead(sessionId, email) {
  await setDoc(doc(db, 'leads', sessionId), {
    sessionId,
    email: email.trim().toLowerCase(),
    createdAt: new Date(),
  });
}
