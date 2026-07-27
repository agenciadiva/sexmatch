import { useState } from 'react';

export default function Paywall({ sessionId, userId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePago() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/crear-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Error al iniciar el pago');
      }

      // Guardar en sessionStorage para recuperar sesión al volver
      sessionStorage.setItem('sm_session', JSON.stringify({ sessionId, userId }));

      // Redirigir a MP
      window.location.href = data.url;

    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="screen center">
      <div className="card paywall-card">
        <div className="big-emoji">🔒</div>
        <h2>Desbloqueá todo</h2>
        <p className="hint">Accedé a todas las coincidencias y continuá con las preguntas más profundas.</p>

       <div className="paywall-features">
  <div className="pw-feat">✅ Todas las coincidencias del primer bloque</div>
  <div className="pw-feat">✅ Segundo bloque de preguntas</div>
  <div className="pw-feat">✅ Análisis de compatibilidad final</div>
</div>

<div className="paywall-note">
  💜 <strong>Un único pago por pareja.</strong> No importa quién pague, ambos desbloquean la experiencia completa.
</div>

<div className="price-box">
  <div className="price-old">$9.900</div>

  <div className="price-launch">
    Oferta de lanzamiento | <strong>45% OFF</strong>
  </div>

  <div className="price-tag">$5.400</div>
</div>

        {error && <p className="error">{error}</p>}

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={handlePago}
          disabled={loading}
        >
          {loading ? 'Redirigiendo a Mercado Pago...' : 'Pagar con Mercado Pago 🚀'}
        </button>
      </div>
    </div>
  );
}
