import { useState } from 'react';
import { createSession, joinSession } from '../utils/sessionUtils';

export default function Home({ onSessionCreated }) {
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const data = await createSession();
      onSessionCreated(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!code.trim()) { setError('Ingresá el código.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await joinSession(code);
      onSessionCreated(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen center">
      <div className="home-card">
        <div className="home-logo">
          <span className="home-fire">🔥</span>
          <h1 className="home-title">Sex Match</h1>
        </div>
        <p className="home-sub">
          Un test para descubrir en cuántas fantasías<br />y deseos coincidís con tu pareja.
        </p>

        {!mode && (
          <div className="home-actions">
            <div className="home-action-block">
              <button className="btn btn-primary btn-full" onClick={() => setMode('create')}>
                Crear sesión
              </button>
              <p className="action-hint">Generás un código y se lo mandás a quien quieras.</p>
            </div>
            <div className="home-action-block">
              <button className="btn btn-secondary btn-full" onClick={() => setMode('join')}>
                Tengo un código
              </button>
              <p className="action-hint">Alguien ya creó la sesión y te pasó el código.</p>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="mode-panel">
            <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={loading}>
              {loading ? 'Generando...' : 'Generar mi código →'}
            </button>
            <button className="btn btn-ghost" onClick={() => setMode(null)}>← Volver</button>
          </div>
        )}

        {mode === 'join' && (
          <div className="mode-panel">
            <input
              className="input"
              placeholder="Código de sesión"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={8}
              autoFocus
            />
            <button className="btn btn-primary btn-full" onClick={handleJoin} disabled={loading}>
              {loading ? 'Buscando...' : 'Unirme →'}
            </button>
            <button className="btn btn-ghost" onClick={() => setMode(null)}>← Volver</button>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
