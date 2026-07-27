import { useState } from 'react';
import { calculateMatches, getCompatibilityLevel } from '../utils/matchUtils';
import { saveLead } from '../utils/sessionUtils';

export default function ResultsFinal({
  answers,
  block1Questions,
  block2Questions,
  userIds,
  sessionId,
  onRestart,
}) {
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailError, setEmailError] = useState('');

  const allQ = [...block1Questions, ...block2Questions];

  const matches1 = calculateMatches(
    answers,
    block1Questions,
    userIds
  );

  const matches2 = calculateMatches(
    answers,
    block2Questions,
    userIds
  );

  const allMatches = calculateMatches(
    answers,
    allQ,
    userIds
  );

  const level = getCompatibilityLevel(
    allMatches.length,
    allQ.length
  );

  const compatibility =
    allQ.length > 0
      ? Math.round((allMatches.length / allQ.length) * 100)
      : 0;

  async function handleEmail() {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !normalizedEmail.includes('@') ||
      !normalizedEmail.includes('.')
    ) {
      setEmailError('Ingresá un mail válido.');
      return;
    }

    setSaving(true);
    setEmailError('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          results: {
            compatibility,
            compatibilityLabel: level.label,

            block1Matches: matches1.map((match) => ({
              question: match.question.text,
              score1: match.score1,
              score2: match.score2,
              total: match.total,
            })),

            block2Matches: matches2.map((match) => ({
              question: match.question.text,
              score1: match.score1,
              score2: match.score2,
              total: match.total,
            })),

            totalMatches: allMatches.length,
            totalQuestions: allQ.length,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'No pudimos enviar el correo.'
        );
      }

      await saveLead(sessionId, normalizedEmail);

      setSaved(true);
    } catch (error) {
      console.error('Error enviando resultados:', error);

      setEmailError(
        error.message ||
          'No pudimos enviar tus resultados. Intentá de nuevo.'
      );
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

          <div
            className="compat-badge"
            style={{ background: level.color }}
          >
            {level.label}
          </div>

          <p className="hint">
            {allMatches.length} coincidencias de {allQ.length}{' '}
            preguntas totales
          </p>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-n">
              {matches1.length}
            </span>

            <span className="stat-label">
              Bloque 1
            </span>
          </div>

          <span className="stat-op">+</span>

          <div className="stat-box">
            <span className="stat-n">
              {matches2.length}
            </span>

            <span className="stat-label">
              Bloque 2
            </span>
          </div>

          <span className="stat-op">=</span>

          <div className="stat-box accent">
            <span className="stat-n">
              {allMatches.length}
            </span>

            <span className="stat-label">
              Total
            </span>
          </div>
        </div>

        {matches1.length > 0 && (
          <>
            <p className="section-label">
              Bloque 1
            </p>

            <ul className="match-list">
              {matches1.map((match) => (
                <MatchRow
                  key={match.question.id}
                  m={match}
                />
              ))}
            </ul>
          </>
        )}

        {matches2.length > 0 && (
          <>
            <p className="section-label">
              Bloque 2
            </p>

            <ul className="match-list">
              {matches2.map((match) => (
                <MatchRow
                  key={match.question.id}
                  m={match}
                />
              ))}
            </ul>
          </>
        )}

        {allMatches.length === 0 && (
          <p
            className="hint"
            style={{ textAlign: 'center' }}
          >
            Sin coincidencias. A veces las diferencias
            son las que encienden la chispa. 💫
          </p>
        )}

        {!saved ? (
          <div className="email-capture">
            <p className="email-title">
              Guardá tus resultados para volver a verlos
              cuando quieras.
            </p>

            <input
              className="input"
              type="email"
              placeholder="tu@mail.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !saving) {
                  handleEmail();
                }
              }}
            />

            {emailError && (
              <p className="error">
                {emailError}
              </p>
            )}

            <button
              className="btn btn-primary btn-full"
              onClick={handleEmail}
              disabled={saving}
            >
              {saving
                ? 'Enviando...'
                : 'Enviar mis resultados →'}
            </button>
          </div>
        ) : (
          <div className="email-success">
            <strong>
              ✅ ¡Listo! Ya te enviamos tus resultados por
              mail.
            </strong>

            <br />
            <br />

            Si no los encontrás en unos minutos, revisá la
            carpeta de Correo no deseado (Spam).
          </div>
        )}

        <button
          className="btn btn-ghost btn-full"
          onClick={onRestart}
        >
          Nueva sesión
        </button>
      </div>
    </div>
  );
}

function MatchRow({ m }) {
  return (
    <li className="match-item">
      <span className="match-text">
        {m.question.text}
      </span>

      <div className="match-scores">
        <span className="score-chip">
          {m.score1}
        </span>

        <span className="score-sep">
          +
        </span>

        <span className="score-chip">
          {m.score2}
        </span>

        <span className="score-total">
          = {m.total}
        </span>
      </div>
    </li>
  );
}