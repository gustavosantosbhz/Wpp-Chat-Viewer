import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '1rem',
            color: '#e9edef',
            padding: '2rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <h2>Algo deu errado</h2>
            <p style={{ color: '#8696a0', maxWidth: '400px' }}>
              {this.state.error?.message || 'Erro desconhecido ao renderizar a conversa.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: '8px 20px',
                background: '#00a884',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Tentar novamente
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
