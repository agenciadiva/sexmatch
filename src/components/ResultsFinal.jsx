import { useState } from 'react';
import { calculateMatches, getCompatibilityLevel } from '../utils/matchUtils';
import { saveLead } from '../utils/sessionUtils';

export default function ResultsFinal({ answers, block1Questions, block2Questions, userIds, sessionId, onRestart }) {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  const allQ = [...block1Questions, ...block2Questions];
  const matches1 = calculateMatches(answers, block1Questions, userIds);
  const matches2 = calculateMatches(answers, block2Questions, userIds);
  const allMatches = calculateMatches(answers, allQ, userIds);
  const level = getCompatibilityLevel(allMatches.length, allQ.length);

  async function handleEmail() {
    if (!email.includes('@')) { setEmailError('Ingresá un mail válido.'); return; }
    setSaving(true);
    try {
      await saveLead(sessionId, email);
      setSaved(true);
    } catch {
      setEmailError('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <div className="q-container">
        <div className="results-hero">
          <span className="big-emoji">🏆</span>
          <h2>Resultados finales</h2>
          <div className="compat-badge" style={{ background: level.color }}>{level.label}</div>
          <p className="hint">{allMatches.length} coincidencias de {allQ.length} preguntas totales</p>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-n">{matches1.length}</span>
            <span className="stat-label">Bloque 1</span>
          </div>
          <span className="stat-op">+</span>
          <div className="stat-box">
            <span className="stat-n">{matches2.length}</span>
            <span className="stat-label">Bloque 2</span>
          </div>
          <span className="stat-op">=</span>
          <div className="stat-box accent">
            <span className="stat-n">{allMatches.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        {matches1.length > 0 && (
          <>
            <p className="section-label">Bloque 1</p>
            <ul className="match-list">
              {matches1.map((m) => <MatchRow key={m.question.id} m={m} />)}
            </ul>
          </>
        )}

        {matches2.length > 0 && (
          <>
            <p className="section-label">Bloque 2</p>
            <ul className="match-list">
              {matches2.map((m) => <MatchRow key={m.question.id} m={m} />)}
            </ul>
          </>
        )}

        {allMatches.length === 0 && (
          <p className="hint" style={{ textAlign: 'center' }}>
            Sin coincidencias. A veces las diferencias son las que encienden la chispa. 💫
          </p>
        )}

        {/* Email capture */}
        {!saved ? (
          <div className="email-capture">
            <p className="email-title">Guardá tus resultados y recibí más tests</p>
            <input
              className="input"
              type="email"
              placeholder="tu@mail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
            />
            {emailError && <p className="error">{emailError}</p>}
            <button className="btn btn-primary btn-full" onClick={handleEmail} disabled={saving}>
              {saving ? 'Guardando...' : 'Recibir más tests →'}
            </button>
          </div>
        ) : (
          <div className="email-success">
            ✅ ¡Listo! Te avisamos cuando haya novedades.
          </div>
        )}

        <button className="btn btn-ghost btn-full" onClick={onRestart}>
          Nueva sesión
        </button>
      </div>
    </div>
  );
}

function MatchRow({ m }) {
  return (
    <li className="match-item">
      <span className="match-text">{m.question.text}</span>
      <div className="match-scores">
        <span className="score-chip">{m.score1}</span>
        <span className="score-sep">+</span>
        <span className="score-chip">{m.score2}</span>
        <span className="score-total">= {m.total}</span>
      </div>
    </li>
  );
}
