import { useState } from 'react';
import { submitAnswer, markBlockCompleted } from '../utils/sessionUtils';
import { QUESTIONS_INTRO } from '../data/questions';

export default function Questions({ questions, sessionId, userId, existingAnswers, block }) {
  const [answers, setAnswers] = useState(() => {
    const init = {};
    questions.forEach((q) => { init[q.id] = 5; });
    existingAnswers.forEach((a) => { init[a.questionId] = a.value; });
    return init;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await Promise.all(questions.map((q) => submitAnswer(sessionId, userId, q.id, answers[q.id])));
      await markBlockCompleted(sessionId, userId, block);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="screen center">
        <div className="card">
          <div className="big-emoji">✅</div>
          <h2>Listo</h2>
          <p className="hint">Esperando a la otra persona...</p>
          <div className="waiting-dots"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="q-container">
        <div className="q-header">
          <p className="q-intro">{QUESTIONS_INTRO}</p>
        </div>

        {questions.map((q, i) => (
          <div key={q.id} className="q-card">
            <p className="q-text">
              <span className="q-num">{i + 1}</span>
              {q.text}
            </p>
            <div className="slider-wrap">
              <input
                type="range"
                min={1}
                max={10}
                value={answers[q.id]}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: Number(e.target.value) }))
                }
                className="slider"
              />
              <div className="slider-labels">
                <span>Nada</span>
                <span className="slider-val">{answers[q.id]}</span>
                <span>Mucho</span>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Ver mis coincidencias →'}
        </button>
      </div>
    </div>
  );
}
