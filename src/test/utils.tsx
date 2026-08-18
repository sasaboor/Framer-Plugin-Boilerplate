import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { NavigationProvider } from '../navigation/NavigationProvider';

// Custom render that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withNavigation?: boolean;
}

export function render(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { withNavigation = false, ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: ReactNode }) => {
    if (withNavigation) {
      return <NavigationProvider>{children}</NavigationProvider>;
    }
    return <>{children}</>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
