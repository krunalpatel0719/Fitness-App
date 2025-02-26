//src/components/ExerciseLibraryLog.jsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

import {
  LuInfo,
  LuPlus,
  LuSearch,
  LuDumbbell,
  LuChevronUp,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuTrash,
  LuBook,
  LuBookmark,
} from "react-icons/lu";

import { useState, useEffect, useRef } from "react";

export function ExerciseLibraryLog({
  item,
  expandedLibraryItem,
  setExpandedLibraryItem,
  quickAddForm,
  setQuickAddForm,
  handleQuickAdd,
  handleQuickAddSubmit,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    // Use IntersectionObserver to detect when element is visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadImage(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  const handlePreviousImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : item.images.length - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev < item.images.length - 1 ? prev + 1 : 0
    );
  };
  const toggleExpand = (e) => {
    setExpandedLibraryItem(
      expandedLibraryItem === item.id ? null : item.id
    );
  };
  
  const cycleImage = (e) => {
    e.stopPropagation();
    handleNextImage(e);
  };
  
  return (
    <div
      key={item.id}
      className="border-b  border-gray-200 dark:border-zinc-700 last:border-0"
      ref = {itemRef}
    >
     <div 
        className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.images[0] && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = "/exercise-placeholder.jpg";
                  }}
                />
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleQuickAdd(item.id, e)}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <LuPlus className="h-4 w-4" />
              Quick Add
            </button>
            <button
              onClick={() =>
                setExpandedLibraryItem(
                  expandedLibraryItem === item.id ? null : item.id
                )
              }
              className="p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            >
              {expandedLibraryItem === item.id ? (
                <LuChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <LuChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        {quickAddForm.exerciseId === item.id && (
          <form
           onClick={(e) => e.stopPropagation()} // Stop propagation at the form level
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation(); // Also stop propagation on submit
              handleQuickAddSubmit(e, item);
            }}
            className="mt-4 p-4 bg-gray-50 dark:bg-zinc-700/50 rounded-lg"
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  min="1"
                  onClick={(e) => e.stopPropagation()}
                  value={quickAddForm.sets}
                  onChange={(e) =>
                    setQuickAddForm((prev) => ({
                      ...prev,
                      sets: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white p-2 text-sm"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reps
                </label>
                <input
                  type="number"
                  min="1"
                  value={quickAddForm.reps}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setQuickAddForm((prev) => ({
                      ...prev,
                      reps: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white p-2 text-sm"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={quickAddForm.weight}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setQuickAddForm((prev) => ({
                      ...prev,
                      weight: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white p-2 text-sm"
                  placeholder="135"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(item.id, e);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add to Workout
              </button>
            </div>
          </form>
        )}
      </div>

      {expandedLibraryItem === item.id && (
        <div className="border-t p-4  border-gray-100 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700/50">
          <div className="mx-auto relative aspect-square max-w-[250px] max-h-[250px]">
            {item.images && item.images.length > 0 ? (
              item.images.map((img, index) => (
                <div
                  key={index}
                  className={`relative h-full w-full rounded-lg overflow-hidden ${
                    index === currentImageIndex ? "block" : "hidden"
                  }`}
                >
                  <div 
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={cycleImage}
                    title="Click to see next image"
                  />
                  <Image
                    src={img}
                    alt={`${item.name} - Example ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/exercise-placeholder.jpg";
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="relative h-full w-full rounded-lg overflow-hidden "  >
                <Image
                  src="/exercise-placeholder.jpg"
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {/* {item.images && item.images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 p-2 rounded-full shadow-sm"
                >
                  <LuChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 p-2 rounded-full shadow-sm"
                >
                  <LuChevronRight className="h-5 w-5" />
                </button>
              </>
            )} */}
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white gap-2 mb-2 mt-4">
              Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
              {item.instructions.map((instruction, index) => (
                <li key={index} className="pl-2">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200 dark:border-zinc-600">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Targets
                </span>
                <p className="capitalize text-gray-900 dark:text-white">
                  {item.muscleGroups.join(", ")}
                </p>
              </div>
              <div className="pl-2">
                <span className="capitalize text-sm text-gray-500 dark:text-gray-400">
                  Difficulty:
                </span>
                <p className="capitalize text-gray-900 dark:text-white">
                  {item.difficulty}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
