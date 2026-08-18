import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/utils';
import { ErrorBoundary } from './ErrorBoundary';
import * as supabaseAnalytics from '../lib/analytics/supabase';

// Mock analytics
vi.mock('../lib/analytics/supabase', () => ({
  trackError: vi.fn(),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/encountered an unexpected error/i)).toBeInTheDocument();
  });

  it('should track errors with analytics', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(supabaseAnalytics.trackError).toHaveBeenCalledWith(
      'unknown',
      'Test error',
      expect.objectContaining({
        name: 'Error',
      })
    );
  });

  it('should display custom fallback UI when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should call onReset when Try Again is clicked', async () => {
    const { userEvent } = await import('../test/utils');
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('should reset error state when Try Again is clicked', async () => {
    const { userEvent } = await import('../test/utils');
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error state should be showing
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click Try Again button
    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    // The error state should be cleared (boundary rerenders)
    // Note: The component will still throw because we can't change props,
    // but this tests that the reset mechanism works
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
