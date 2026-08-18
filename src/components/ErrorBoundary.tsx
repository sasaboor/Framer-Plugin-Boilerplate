import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '../lib/analytics/supabase';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches React component errors and prevents the entire app from crashing.
 * Displays a fallback UI and logs errors to analytics.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to analytics
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    trackError('unknown', error.message, {
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      name: error.name,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full p-6 space-y-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-red-600">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-600">
                The application encountered an unexpected error. This has been logged and we'll look into it.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-48">
                <p className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer">
                      Component Stack
                    </summary>
                    <p className="text-xs font-mono text-gray-700 mt-1 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </p>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
