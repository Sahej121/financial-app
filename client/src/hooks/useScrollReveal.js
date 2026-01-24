import { useState, useEffect, useRef } from 'react';

const useScrollReveal = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entry => {
            // Only set visible to true once to prevent flickering
            if (entry[0].isIntersecting) {
                setIsVisible(true);
                observer.unobserve(domRef.current);
            }
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold]);

    return [domRef, isVisible];
};

export default useScrollReveal;
