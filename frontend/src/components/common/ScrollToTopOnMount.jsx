import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTopOnMount Component
 * This component runs an effect whenever the URL path changes,
 * automatically resetting the window's vertical scroll position to the top.
 * This ensures that a new page view always starts at the beginning.
 */
const ScrollToTopOnMount = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll the window to the top (x=0, y=0) on navigation
        window.scrollTo(0, 0);
    }, [location.pathname]); 

    // This component renders nothing
    return null;
};

export default ScrollToTopOnMount;
