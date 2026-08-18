import { ReactNode, useState, useCallback, useEffect, useRef } from "react";
import { NavigationState, Route } from "./types";
import { RouteParamList, RouteName } from "./routes";
import { NavigationContext } from "./useNavigation";

interface NavigationProviderProps {
  children: ReactNode;
  initialRoute: RouteName;
}

export function NavigationProvider({
  children,
  initialRoute,
}: NavigationProviderProps) {
  const [state, setState] = useState<NavigationState>({
    routes: [{ name: initialRoute }],
    index: 0,
  });

  // Track scroll positions for each route index
  const scrollPositions = useRef<Map<number, number>>(new Map());
  // Track if the last navigation was backwards
  const isGoingBack = useRef(false);

  useEffect(() => {
    // Use setTimeout to ensure DOM has updated with new screen
    const timeoutId = setTimeout(() => {
      // Scroll all potential scroll containers to ensure the screen starts at the top
      const scrollableElements = [
        ...Array.from(document.querySelectorAll('.overflow-y-auto')),
        document.querySelector('main'),
        document.querySelector("#root"),
        document.body,
        window
      ].filter(Boolean);

      console.log('[Navigation] isGoingBack:', isGoingBack.current, 'index:', state.index);
      console.log('[Navigation] Found scrollable elements:', scrollableElements.length);

      if (isGoingBack.current) {
        // Restore scroll position when going back
        const savedPosition = scrollPositions.current.get(state.index) || 0;
        console.log('[Navigation] Going back - restoring position:', savedPosition);

        scrollableElements.forEach(el => {
          if (el === window) {
            window.scrollTo({ top: savedPosition, behavior: "instant" });
          } else if (el instanceof HTMLElement) {
            el.scrollTo({ top: savedPosition, behavior: "instant" });
          }
        });

        isGoingBack.current = false;
      } else {
        // Scroll to top when navigating forward
        console.log('[Navigation] Going forward - scrolling to top');

        scrollableElements.forEach(el => {
          if (el === window) {
            window.scrollTo({ top: 0, behavior: "instant" });
          } else if (el instanceof HTMLElement) {
            el.scrollTo({ top: 0, behavior: "instant" });
          }
        });
      }
    }, 50); // Increased timeout to ensure DOM is fully ready

    return () => clearTimeout(timeoutId);
  }, [state.index, state.routes]);

  const navigate = useCallback(
    <TRouteName extends RouteName>(
      name: TRouteName,
      params?: RouteParamList[TRouteName]
    ) => {
      // Save current scroll position before navigating - find the element that's actually scrolled
      const overflowElements = document.querySelectorAll('.overflow-y-auto');
      let scrollPosition = 0;

      // Check overflow-y-auto elements first
      if (overflowElements.length > 0) {
        const el = overflowElements[0] as HTMLElement;
        scrollPosition = el.scrollTop;
      }
      // Check window scroll
      else if (window.scrollY > 0) {
        scrollPosition = window.scrollY;
      }
      // Check main element
      else {
        const mainElement = document.querySelector('main');
        if (mainElement && mainElement.scrollTop > 0) {
          scrollPosition = mainElement.scrollTop;
        }
      }

      if (scrollPosition > 0) {
        scrollPositions.current.set(state.index, scrollPosition);
        console.log('[Navigation] Saving scroll position:', scrollPosition, 'for index:', state.index);
      }

      isGoingBack.current = false;
      setState((prev) => ({
        routes: [
          ...prev.routes.slice(0, prev.index + 1),
          { name, params } as Route<RouteParamList[TRouteName]>,
        ],
        index: prev.index + 1,
      }));
    },
    [state.index]
  );

  const goBack = useCallback(() => {
    // Save current scroll position before going back
    const overflowElements = document.querySelectorAll('.overflow-y-auto');
    let scrollPosition = 0;

    // Check overflow-y-auto elements first
    if (overflowElements.length > 0) {
      const el = overflowElements[0] as HTMLElement;
      scrollPosition = el.scrollTop;
    }
    // Check window scroll
    else if (window.scrollY > 0) {
      scrollPosition = window.scrollY;
    }
    // Check main element
    else {
      const mainElement = document.querySelector('main');
      if (mainElement && mainElement.scrollTop > 0) {
        scrollPosition = mainElement.scrollTop;
      }
    }

    if (scrollPosition > 0) {
      scrollPositions.current.set(state.index, scrollPosition);
      console.log('[Navigation] Saving scroll position before going back:', scrollPosition, 'for index:', state.index);
    }

    isGoingBack.current = true;
    setState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1),
    }));
  }, [state.index]);

  const canGoBack = useCallback(() => {
    return state.index > 0;
  }, [state.index]);

  const currentRoute = state.routes[state.index];

  const replace = useCallback(
    <TRouteName extends RouteName>(
      name: TRouteName,
      params?: RouteParamList[TRouteName]
    ) => {
      isGoingBack.current = false;
      setState((prev) => ({
        routes: [
          ...prev.routes.slice(0, prev.index),
          { name, params } as Route<RouteParamList[TRouteName]>,
        ],
        index: prev.index,
      }));
    },
    []
  );

  return (
    <NavigationContext.Provider
      value={{
        state,
        navigate,
        replace,
        goBack,
        canGoBack,
        currentRoute,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
