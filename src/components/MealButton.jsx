// src/components/MealButton.jsx
"use client";

import { Button } from "@/components/ui/button";

export function MealButton({ meal, selected, onClick }) {
  const formattedMeal = meal.charAt(0).toUpperCase() + meal.slice(1);
  
  return (
    <Button
      variant={selected === meal ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={
        selected === meal 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'dark:hover:bg-zinc-700'
      }
    >
      {formattedMeal}
    </Button>
  );
}