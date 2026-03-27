import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Caught render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#0b0f17",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            color: "#e2e8f0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 32 }}>⚠️</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: 420,
              margin: 0,
            }}
          >
            The app encountered an unexpected error. Please refresh the page.
          </p>
          {this.state.error && (
            <pre
              style={{
                fontSize: 11,
                color: "#ff6b6b",
                background: "#1a1f2e",
                padding: "12px 16px",
                borderRadius: 6,
                maxWidth: 560,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 20px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
