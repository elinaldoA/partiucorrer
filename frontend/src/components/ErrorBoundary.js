import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  handleReload = () => {
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <div className="card max-w-md w-full text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Algo deu errado
            </h2>
            <p className="text-gray-600 mb-6">
              Desculpe, ocorreu um erro inesperado.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">Detalhes do erro:</p>
                <pre className="text-xs text-red-600 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            <div className="space-y-3">
              <button onClick={this.handleReset} className="btn-primary w-full">
                Tentar novamente
              </button>
              <button onClick={this.handleReload} className="btn-secondary w-full">
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;