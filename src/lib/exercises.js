// src/lib/exercises.js

import exercisesData from '@/data/exercises.json';

export const getAllExercises = () => {
    try {
      return exercisesData.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        difficulty: exercise.level,
        equipment: exercise.equipment,
        category: exercise.category,
        primaryMuscles: exercise.primaryMuscles || [],
        secondaryMuscles: exercise.secondaryMuscles || [],
        // Add this property to fix the search
        muscleGroups: [...(exercise.primaryMuscles || []), ...(exercise.secondaryMuscles || [])],
        instructions: exercise.instructions || [],
        images: Array.isArray(exercise.images) 
          ? exercise.images.map(img => `/exercises/${img}`)
          : ['/exercise-placeholder.jpg']
      }));
    } catch (error) {
      console.error("Error loading exercises:", error);
      return [];
    }
  };
  
  export const searchExercises = (query) => {
    const q = query.toLowerCase();
    return getAllExercises().filter(exercise => 
      exercise.name.toLowerCase().includes(q) ||
      (exercise.muscleGroups && exercise.muscleGroups.some(m => m?.toLowerCase().includes(q))) ||
      (exercise.category && exercise.category.toLowerCase().includes(q)) ||
      (exercise.equipment && exercise.equipment.toLowerCase().includes(q))
    );
  };