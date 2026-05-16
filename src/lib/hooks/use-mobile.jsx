import * as React from "react";

// The screen width at which we consider a device "mobile"
const MOBILE_BREAKPOINT = 768;

// This hook tells you if the current screen is a mobile screen size
export function useIsMobile() {
  // Start with undefined (we don't know yet until the page loads)
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // Watch for screen size changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // This runs every time the screen size crosses the breakpoint
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    mql.addEventListener('change', onChange);
    
    // Check immediately when the component loads
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    // Clean up the listener when component unmounts
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Convert to true/false (!! makes undefined become false)
  return !!isMobile;
}
