import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: "#0a0e14",
          color: "#10b981",
          fontFamily: "monospace",
          padding: "2rem",
          height: "100vh",
          whiteSpace: "pre-wrap",
        }}>
          <h1 style={{ color: "#ef4444" }}>SYSTEM ERROR</h1>
          <p>{this.state.error.message}</p>
          <pre style={{ color: "#71717a", fontSize: "0.75rem", marginTop: "1rem" }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#10b981",
              color: "#000",
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
