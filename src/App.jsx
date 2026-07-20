import { useState, useEffect } from 'react';
import { useSession, useAnswers } from './hooks/useSession';
import { advancePhase } from './utils/sessionUtils';
import { questions } from './data/questions';

import Home from './components/Home';
import WaitingRoom from './components/WaitingRoom';
import Questions from './components/Questions';
import ResultsPartial from './components/ResultsPartial';
import Paywall from './components/Paywall';
import ResultsFull from './components/ResultsFull';
import ResultsFinal from './components/ResultsFinal';

const block1Qs = questions.filter((q) => q.block === 1);
const block2Qs = questions.filter((q) => q.block === 2);

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId]       = useState(null);
  const [pagoEstado, setPagoEstado] = useState(null); // 'ok' | 'error' | 'pendiente'

  const { session, loading } = useSession(sessionId);
  const answers = useAnswers(sessionId);

  // ── Detectar retorno desde Mercado Pago ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pago = params.get('pago');
    const sesion = params.get('sesion');
    const uid = params.get('uid');

    if (pago && sesion) {
      setPagoEstado(pago);

      // Intentar recuperar sesión desde sessionStorage (por si el browser limpió la URL)
      let resolvedUid = uid;
      if (!resolvedUid) {
        try {
          const stored = JSON.parse(sessionStorage.getItem('sm_session') || '{}');
          resolvedUid = stored.userId;
        } catch {}
      }

      setSessionId(sesion);
      if (resolvedUid) setUserId(resolvedUid);

      // Limpiar URL sin recargar la página
      window.history.replaceState({}, '', '/');

      // Si el pago fue aprobado, avanzar fase
      if (pago === 'ok') {
        advancePhase(sesion, 'results_full');
      }
    } else {
      // Flujo normal: recuperar de sessionStorage si existe
      try {
        const stored = JSON.parse(sessionStorage.getItem('sm_session') || '{}');
        if (stored.sessionId && stored.userId) {
          setSessionId(stored.sessionId);
          setUserId(stored.userId);
        }
      } catch {}
    }
  }, []);

  // ── Auto-advance block 1 → results_partial ──────────────────
  useEffect(() => {
    if (!session || session.currentPhase !== 'questions_1') return;
    if (session.completedBlock1?.length === 2 && session.users?.length === 2) {
      advancePhase(sessionId, 'results_partial');
    }
  }, [session, sessionId]);

  // ── Auto-advance block 2 → results_final ───────────────────
  useEffect(() => {
    if (!session || session.currentPhase !== 'questions_2') return;
    if (session.completedBlock2?.length === 2 && session.users?.length === 2) {
      advancePhase(sessionId, 'results_final');
    }
  }, [session, sessionId]);

  function handleSessionCreated({ sessionId, userId, code }) {
    setSessionId(sessionId);
    setUserId(userId);
    // Guardar en sessionStorage para sobrevivir redirects
    sessionStorage.setItem('sm_session', JSON.stringify({ sessionId, userId }));
  }

  function handleRestart() {
    sessionStorage.removeItem('sm_session');
    setSessionId(null);
    setUserId(null);
    setPagoEstado(null);
  }

  // ── Pago fallido ────────────────────────────────────────────
  if (pagoEstado === 'error') {
    return (
      <div className="screen center">
        <div className="card">
          <div className="big-emoji">😕</div>
          <h2>El pago no se completó</h2>
          <p className="hint">Podés intentarlo de nuevo cuando quieras.</p>
          <button className="btn btn-primary btn-full" onClick={() => {
            setPagoEstado(null);
            // la sesión sigue cargada, volvemos al paywall
          }}>
            Reintentar pago
          </button>
          <button className="btn btn-ghost" onClick={handleRestart}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  if (pagoEstado === 'pendiente') {
    return (
      <div className="screen center">
        <div className="card">
          <div className="big-emoji">⏳</div>
          <h2>Pago pendiente</h2>
          <p className="hint">Tu pago está siendo procesado. Cuando se confirme, se desbloquea automáticamente.</p>
          <button className="btn btn-ghost" onClick={handleRestart}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  if (!sessionId) return <Home onSessionCreated={handleSessionCreated} />;

  if (loading) return <div className="screen center"><div className="spinner" /></div>;

  if (!session) return (
    <div className="screen center">
      <div className="card">
        <p className="hint">Sesión no encontrada.</p>
        <button className="btn btn-ghost" onClick={handleRestart}>Volver</button>
      </div>
    </div>
  );

  if (session.status === 'waiting') return <WaitingRoom code={session.code} />;

  const phase = session.currentPhase;

  if (phase === 'questions_1') {
    if (session.completedBlock1?.includes(userId)) {
      return (
        <div className="screen center">
          <div className="card">
            <div className="big-emoji">✅</div>
            <h2>¡Listo!</h2>
            <p className="hint">Esperando a la otra persona...</p>
            <div className="waiting-dots"><span /><span /><span /></div>
          </div>
        </div>
      );
    }
    const myAnswers = answers.filter((a) => a.userId === userId && block1Qs.find((q) => q.id === a.questionId));
    return <Questions key="b1" questions={block1Qs} sessionId={sessionId} userId={userId} existingAnswers={myAnswers} block={1} />;
  }

  if (phase === 'results_partial') {
    return <ResultsPartial answers={answers} questions={block1Qs} userIds={session.users} sessionId={sessionId} />;
  }

  if (phase === 'paywall') {
    return <Paywall sessionId={sessionId} userId={userId} />;
  }

  if (phase === 'results_full') {
    return <ResultsFull answers={answers} questions={block1Qs} userIds={session.users} sessionId={sessionId} />;
  }

  if (phase === 'questions_2') {
    if (session.completedBlock2?.includes(userId)) {
      return (
        <div className="screen center">
          <div className="card">
            <div className="big-emoji">✅</div>
            <h2>¡Listo!</h2>
            <p className="hint">Esperando a la otra persona...</p>
            <div className="waiting-dots"><span /><span /><span /></div>
          </div>
        </div>
      );
    }
    const myAnswers = answers.filter((a) => a.userId === userId && block2Qs.find((q) => q.id === a.questionId));
    return <Questions key="b2" questions={block2Qs} sessionId={sessionId} userId={userId} existingAnswers={myAnswers} block={2} />;
  }

  if (phase === 'results_final') {
    return (
      <ResultsFinal
        answers={answers}
        block1Questions={block1Qs}
        block2Questions={block2Qs}
        userIds={session.users}
        sessionId={sessionId}
        onRestart={handleRestart}
      />
    );
  }

  return <div className="screen center"><div className="card"><p className="hint">Fase: {phase}</p></div></div>;
}
