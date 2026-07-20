export default function WaitingRoom({ code }) {
  return (
    <div className="screen center">
      <div className="card">
        <p className="waiting-label">Tu código</p>
        <div className="code-display">{code}</div>
        <p className="hint">Mandáselo a la otra persona.<br />Cuando se una, empezamos automáticamente.</p>
        <div className="waiting-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
