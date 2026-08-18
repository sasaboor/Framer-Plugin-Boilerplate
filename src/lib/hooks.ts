import { useEffect } from "react";

/**
 * Smooth scroll to top when component mounts
 */
export function useScrollToTop() {
  useEffect(() => {
    const rootEl = document.querySelector("#root");
    if (rootEl) {
      rootEl.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

