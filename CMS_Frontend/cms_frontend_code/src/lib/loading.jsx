import "../index.css";

export default function Loader({ fullscreen = false, message = "Loading…" }) {
  return (
    <div
      className={`ld-wrap ${fullscreen ? "ld--fullscreen" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="ld-progress" aria-hidden="true">
        <span className="ld-bar ld-bar1" />
        <span className="ld-bar ld-bar2" />
      </div>

      <div className="ld-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="ld-card" key={i}>
            <div className="ld-thumb" />
            <div className="ld-lines">
              <div className="ld-line w70" />
              <div className="ld-line w90" />
              <div className="ld-line w50" />
            </div>
          </div>
        ))}
      </div>

      <p className="ld-caption">{message}</p>
      <span className="ld-sr-only">Content is loading, please wait.</span>
    </div>
  );
}
