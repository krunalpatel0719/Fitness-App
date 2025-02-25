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
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : item.images.length - 1));
  };

  
  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev < item.images.length - 1 ? prev + 1 : 0));
  };
  return (
    <div
      key={item.id}
      className="border-b border-gray-200 dark:border-zinc-700 last:border-0"
    >
      <button
        onClick={() =>
          setExpandedLibraryItem(
            expandedLibraryItem === item.id ? null : item.id
          )
        }
        className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
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
                    e.target.src = '/exercise-placeholder.jpg';
                  }}
                />
              </div>
            )}
            {/* <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.muscleGroups.join(", ")}
              </p>
            </div>
          </div> */}
          <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {item.name}
              </h3>
              {/* <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                  {item.difficulty}
                </span>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  {item.category}
                </span>
              </div> */}
            </div>
          </div>
          {expandedLibraryItem === item.id ? (
            <LuChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <LuChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {expandedLibraryItem === item.id && (
        <div className="p-4 bg-gray-50 dark:bg-zinc-700/50">
         <div className="relative aspect-square w-full mb-4">
            {/* {item.images.map((img, index) => (
              <div
                key={index}
                className={`relative h-full w-full rounded-lg overflow-hidden ${
                  index === currentImageIndex ? 'block' : 'hidden'
                }`}
              >
                <Image
                  src={img}
                  alt={`${item.name} - Example ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = '/exercise-placeholder.jpg';
                  }}
                />
              </div>
            ))} */}
            {(item.images && item.images.length > 0) ? (
              item.images.map((img, index) => (
                <div
                  key={index}
                  className={`relative h-full w-full rounded-lg overflow-hidden ${
                    index === currentImageIndex ? 'block' : 'hidden'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${item.name} - Example ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = '/exercise-placeholder.jpg';
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="relative h-full w-full rounded-lg overflow-hidden">
                <Image
                  src="/exercise-placeholder.jpg"
                  alt={item.name}
                  fill
                  
                  className="object-cover"
                />
              </div>
            )}
           {item.images && item.images.length > 1 && (
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
            )}
          </div>
          {/* <p className="text-gray-600 dark:text-gray-300 mb-4">
            {item.description}
          </p>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-300">
              {item.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Difficulty: {item.difficulty}
            </span>
          </div>
        </div> */}
                  {/* <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Equipment:</p>
              <p className="font-medium">{item.equipment || 'None'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Primary Muscles:</p>
              <p className="font-medium">{item.primaryMuscles.join(", ")}</p>
            </div>
          </div> */}
          <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Instructions:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
            {item.instructions.map((instruction, index) => (
              <li key={index} className="pl-2">{instruction}</li>
            ))}
          </ol>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <span className="capitalize text-sm text-gray-500 dark:text-gray-400">
              Difficulty: {item.difficulty}
            </span>
          </div>
        </div>

      )}
    </div>
  );
}
