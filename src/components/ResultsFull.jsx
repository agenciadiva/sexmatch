import { calculateMatches, getCompatibilityLevel } from '../utils/matchUtils';
import { advancePhase } from '../utils/sessionUtils';

export default function ResultsFull({ answers, questions, userIds, sessionId }) {
  const matches = calculateMatches(answers, questions, userIds);
  const level = getCompatibilityLevel(matches.length, questions.length);

  return (
    <div className="screen">
      <div className="q-container">
        <div className="results-hero">
          <span className="big-emoji">🎉</span>
          <h2>Resultados completos</h2>
          <div className="compat-badge" style={{ background: level.color }}>{level.label}</div>
          <p className="hint">{matches.length} de {questions.length} preguntas en coincidencia</p>
        </div>

        {matches.length === 0 ? (
          <p className="hint" style={{ textAlign: 'center' }}>Sin coincidencias en este bloque. El siguiente puede sorprender.</p>
        ) : (
          <ul className="match-list">
            {matches.map((m) => (
              <li key={m.question.id} className="match-item">
                <span className="match-text">{m.question.text}</span>
                <div className="match-scores">
                  <span className="score-chip">{m.score1}</span>
                  <span className="score-sep">+</span>
                  <span className="score-chip">{m.score2}</span>
                  <span className="score-total">= {m.total}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={() => advancePhase(sessionId, 'questions_2')}>
          Continuar al siguiente bloque →
        </button>
      </div>
    </div>
  );
}
