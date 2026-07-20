import { calculateMatches, getPreviewMatches } from '../utils/matchUtils';
import { advancePhase } from '../utils/sessionUtils';

export default function ResultsPartial({ answers, questions, userIds, sessionId }) {
  const allMatches = calculateMatches(answers, questions, userIds);
  const preview = getPreviewMatches(allMatches);
  const hidden = allMatches.length - preview.length;

  return (
    <div className="screen">
      <div className="q-container">
        <div className="results-hero">
          <span className="big-emoji">🎯</span>
          <h2>Primeros resultados</h2>
          <p className="hint">
            {allMatches.length === 0
              ? 'No hubo coincidencias en este bloque.'
              : `Encontramos ${allMatches.length} coincidencia${allMatches.length !== 1 ? 's' : ''}.`}
          </p>
        </div>

        {preview.length > 0 && (
          <ul className="match-list">
            {preview.map((m) => (
              <MatchCard key={m.question.id} m={m} />
            ))}
          </ul>
        )}

        {hidden > 0 && (
          <div className="blur-teaser">
            <div className="blur-row">
              ••• {hidden} coincidencia{hidden !== 1 ? 's' : ''} más •••
            </div>
          </div>
        )}

        {allMatches.length === 0 && (
          <div className="no-match-note">
            A veces las diferencias son las que generan chispa. Seguí para descubrir más.
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={() => advancePhase(sessionId, 'paywall')}>
          Ver todo →
        </button>
      </div>
    </div>
  );
}

function MatchCard({ m }) {
  return (
    <li className="match-item">
      <span className="match-text">{m.question.text}</span>
      <div className="match-scores">
        <span className="score-chip">{m.score1}</span>
        <span className="score-sep">+</span>
        <span className="score-chip">{m.score2}</span>
      </div>
    </li>
  );
}
