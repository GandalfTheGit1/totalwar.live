import { useState, useEffect, useRef } from 'react';

export function useGlobeResize(globeInstanceRef: React.MutableRefObject<any>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerDimensions({ width: clientWidth, height: clientHeight });
        if (globeInstanceRef.current) {
          globeInstanceRef.current.width(clientWidth);
          globeInstanceRef.current.height(clientHeight);
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [globeInstanceRef]);

  return { containerRef, containerDimensions };
}