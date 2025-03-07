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
  const [containerHeight, setContainerHeight] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  // Enhanced calculation of visible range with better buffer
  const calculateVisibleRange = (scrollTop = containerRef.current?.scrollTop || 0) => {
    if (!containerRef.current) return;
    
    const viewportHeight = containerRef.current.clientHeight;
    const bufferSize = Math.ceil(viewportHeight / itemHeight) * 2; // Dynamic buffer based on viewport
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - Math.floor(bufferSize / 2));
    const end = Math.min(
      exercises.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + Math.ceil(bufferSize / 2)
    );
    
    setVisibleRange({ start, end });
  };

  // Initial setup and measurements
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initial container height
    setContainerHeight(containerRef.current.clientHeight);
    
    // Initial calculation with a slight delay to ensure DOM has rendered
    const timer = setTimeout(() => {
      calculateVisibleRange();
      setIsInitialized(true);
    }, 50);
    
    // Measure actual item height for better calculation
    if (containerRef.current.children.length > 1) {
      const firstItem = containerRef.current.querySelector('[data-exercise-item]');
      if (firstItem && firstItem.offsetHeight > 0) {
        setItemHeight(firstItem.offsetHeight);
      }
    }
    
    // Window resize handler
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

  // Handle search changes or other major list updates
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Save scroll position before updating
    const scrollPosition = containerRef.current.scrollTop;
    setLastScrollPosition(scrollPosition);
    
    // Reset scroll if this is a new search
    if (containerRef.current && isInitialized) {
      // Only scroll to top on new searches, not on initial load
      // containerRef.current.scrollTop = 0;
    }
    
    // Recalculate visible range
    const timer = setTimeout(() => {
      calculateVisibleRange();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [exercises]);

  // Handle expanded item changes - preserve scroll position
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Small timeout to let the DOM update before restoring scroll
    const timer = setTimeout(() => {
      if (containerRef.current) {
        calculateVisibleRange();
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [expandedLibraryItem]);

  // Set up scroll event listener
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

  // Calculate total scroll height
  const totalHeight = exercises.length * itemHeight;
  
  // Calculate the amount of space to pad before visible items
  const paddingTop = visibleRange.start * itemHeight;
  
  // Get only the visible items
  const visibleItems = exercises.slice(visibleRange.start, visibleRange.end);

  // Handle expanding items without scroll jump
  const handleExpand = (itemId) => {
    // Store current scroll position
    const currentScroll = containerRef.current?.scrollTop || 0;
    
    // Update expanded state
    setExpandedLibraryItem(expandedLibraryItem === itemId ? null : itemId);
    
    // Restore scroll position after state update
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
          {/* Spacer div to maintain scroll position */}
          <div style={{ height: paddingTop }} />
          
          {/* Only render visible items */}
          {visibleItems.map((item) => (
            <div key={item.id} data-exercise-item>
              <ExerciseLibraryLog 
                item={item} 
                expandedLibraryItem={expandedLibraryItem} 
                setExpandedLibraryItem={handleExpand} // Use our custom handler
                quickAddForm={quickAddForm}
                setQuickAddForm={setQuickAddForm}
                handleQuickAdd={handleQuickAdd}
                handleQuickAddSubmit={handleQuickAddSubmit}
              />
            </div>
          ))}
          
          {/* Bottom spacer to ensure scrollbar has correct size */}
          <div style={{ height: Math.max(0, totalHeight - paddingTop - (visibleItems.length * itemHeight)) }} />
        </>
      )}
    </div>
  );
}