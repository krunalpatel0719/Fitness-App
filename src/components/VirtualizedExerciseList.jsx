import { useState, useEffect, useRef } from "react";
import { ExerciseLibraryLog } from "@/components/ExerciseLibraryLog";

export function VirtualizedExerciseList({
  exercises,
  expandedLibraryItem,
  setExpandedLibraryItem,
  quickAddForm,
  setQuickAddForm,
  handleQuickAdd,
  handleQuickAddSubmit,
}) {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [itemHeight, setItemHeight] = useState(80); 
  const [containerHeight, setContainerHeight] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  const calculateVisibleRange = (scrollTop = containerRef.current?.scrollTop || 0) => {
    if (!containerRef.current) return;
    
    const viewportHeight = containerRef.current.clientHeight;
    const bufferSize = Math.ceil(viewportHeight / itemHeight) * 2;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - Math.floor(bufferSize / 2));
    const end = Math.min(
      exercises.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + Math.ceil(bufferSize / 2)
    );
    
    setVisibleRange({ start, end });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    setContainerHeight(containerRef.current.clientHeight);
    
    const timer = setTimeout(() => {
      calculateVisibleRange();
      setIsInitialized(true);
    }, 50);
    
    if (containerRef.current.children.length > 1) {
      const firstItem = containerRef.current.querySelector('[data-exercise-item]');
      if (firstItem && firstItem.offsetHeight > 0) {
        setItemHeight(firstItem.offsetHeight);
      }
    }
    
    const handleResize = () => {
      setContainerHeight(containerRef.current?.clientHeight || 0);
      calculateVisibleRange();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const scrollPosition = containerRef.current.scrollTop;
    setLastScrollPosition(scrollPosition);
    
    if (containerRef.current && isInitialized) {
  
    }
    
    // Recalculate visible range
    const timer = setTimeout(() => {
      calculateVisibleRange();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [exercises]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const timer = setTimeout(() => {
      if (containerRef.current) {
        calculateVisibleRange();
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [expandedLibraryItem]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setLastScrollPosition(scrollTop);
      calculateVisibleRange(scrollTop);
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [itemHeight, exercises.length]);

  const totalHeight = exercises.length * itemHeight;
  
  const paddingTop = visibleRange.start * itemHeight;
  
  const visibleItems = exercises.slice(visibleRange.start, visibleRange.end);

  const handleExpand = (itemId) => {
    const currentScroll = containerRef.current?.scrollTop || 0;
    
    setExpandedLibraryItem(expandedLibraryItem === itemId ? null : itemId);
    
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = currentScroll;
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      className="exercise-library-container h-[485px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
    >
      {exercises.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No exercises found
        </div>
      ) : (
        <>
          <div style={{ height: paddingTop }} />
          
          {visibleItems.map((item) => (
            <div key={item.id} data-exercise-item>
              <ExerciseLibraryLog 
                item={item} 
                expandedLibraryItem={expandedLibraryItem} 
                setExpandedLibraryItem={handleExpand}
                quickAddForm={quickAddForm}
                setQuickAddForm={setQuickAddForm}
                handleQuickAdd={handleQuickAdd}
                handleQuickAddSubmit={handleQuickAddSubmit}
              />
            </div>
          ))}
          
          <div style={{ height: Math.max(0, totalHeight - paddingTop - (visibleItems.length * itemHeight)) }} />
        </>
      )}
    </div>
  );
}