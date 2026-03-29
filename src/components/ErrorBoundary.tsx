import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  public props: any;
  public state = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-4">Something went wrong.</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-full hover:bg-[#F9E79F] transition-colors"
          >
            Refresh Page
          </button>
          {this.state.error && (
            <div className="mt-8 p-4 bg-gray-900 rounded-lg text-left overflow-auto max-w-2xl w-full">
              <p className="text-red-500 font-mono text-sm">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
