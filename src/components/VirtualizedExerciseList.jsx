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
  const [itemHeight, setItemHeight] = useState(80); // Default height estimation
  const bufferItems = 5; // Number of items to render above/below viewport

  // Calculate which items should be visible based on scroll position
  const calculateVisibleRange = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    
    // Estimate which items are visible
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferItems);
    const end = Math.min(
      exercises.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferItems
    );
    
    setVisibleRange({ start, end });
  };

  // Reset scroll position and visible range when exercises change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Reset scroll position
      setVisibleRange({ start: 0, end: Math.min(20, exercises.length) }); // Reset visible range
    }
    
    // Recalculate after a short delay to ensure DOM has updated
    const timer = setTimeout(() => {
      calculateVisibleRange();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [exercises]);

  // Measure actual item height after first render for better estimation
  useEffect(() => {
    if (containerRef.current && containerRef.current.children.length > 1) {
      const firstItem = containerRef.current.children[1]; // Skip the padding div
      if (firstItem && firstItem.offsetHeight > 0) {
        setItemHeight(firstItem.offsetHeight);
      }
    }
  }, [exercises.length > 0]);

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    calculateVisibleRange();
    container.addEventListener('scroll', calculateVisibleRange);
    
    // Clean up
    return () => {
      container.removeEventListener('scroll', calculateVisibleRange);
    };
  }, [exercises.length, itemHeight]);

  // Calculate total scroll height
  const totalHeight = exercises.length * itemHeight;
  
  // Calculate the amount of space to pad before visible items
  const paddingTop = visibleRange.start * itemHeight;
  
  // Get only the visible items
  const visibleItems = exercises.slice(visibleRange.start, visibleRange.end);

  return (
    <div 
      ref={containerRef}
      className="exercise-library-container max-h-[485px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent"
    >
      {exercises.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No exercises found
        </div>
      ) : (
        <>
          {/* Spacer div to maintain scroll position */}
          <div style={{ height: paddingTop }} />
          
          {/* Only render visible items */}
          {visibleItems.map((item) => (
            <ExerciseLibraryLog 
              key={item.id} 
              item={item} 
              expandedLibraryItem={expandedLibraryItem} 
              setExpandedLibraryItem={setExpandedLibraryItem}
              quickAddForm={quickAddForm}
              setQuickAddForm={setQuickAddForm}
              handleQuickAdd={handleQuickAdd}
              handleQuickAddSubmit={handleQuickAddSubmit}
            />
          ))}
          
          {/* Bottom spacer to ensure scrollbar has correct size */}
          <div style={{ height: Math.max(0, totalHeight - paddingTop - (visibleItems.length * itemHeight)) }} />
        </>
      )}
    </div>
  );
}