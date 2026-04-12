import { useState, useEffect, useRef } from 'react';

function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(target: number, duration: number = 1800): number {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) {
            setValue(0);
            return;
        }

        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setValue(Math.round(easeOut(progress) * target));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [target, duration]);

    return value;
}
