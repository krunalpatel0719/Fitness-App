//src/components/WorkoutLog.jsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VirtualizedExerciseList } from "@/components/VirtualizedExerciseList";
import {
  LuInfo,
  LuPlus,
  LuSearch,
  LuDumbbell,
  LuChevronUp,
  LuChevronDown,
  LuTrash,
  LuBook,
  LuBookmark,
} from "react-icons/lu";
import { ExerciseLibraryLog } from "@/components/ExerciseLibraryLog";
import { useState, useEffect } from "react";
import {
  addOrUpdateExerciseLog,
  subscribeToExerciseLogs,
  updateExerciseSets,
  deleteExerciseLog,
} from "@/lib/firebaseExercises";
import { getAllExercises, searchExercises } from "@/lib/exercises";

export function WorkoutLog({ selectedDate }) {
  const { userLoggedIn, currentUser } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState([]);
  const [expandedLibraryItem, setExpandedLibraryItem] = useState(null);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [quickAddForm, setQuickAddForm] = useState({
    exerciseId: null,
    name: "",
    sets: "",
    reps: "",
    weight: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const exercisesPerPage = 20;

  useEffect(() => {
    const allExercises = getAllExercises();
    setExerciseLibrary(allExercises);
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToExerciseLogs(
      currentUser.uid,
      selectedDate,
      (logs) => setExercises(logs)
    );

    return () => unsubscribe();
  }, [currentUser, selectedDate]);



  const toggleExercise = (exerciseId) => {
    setExpandedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };


  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const query = searchQuery.toLowerCase();
    return (
      exercise.name.toLowerCase().includes(query) ||
      (exercise.muscleGroups &&
        exercise.muscleGroups.some((group) =>
          group.toLowerCase().includes(query)
        )) ||
      (exercise.difficulty && exercise.difficulty.toLowerCase().includes(query))
    );
  });


  const handleAddExercise = async (e) => {
    e.preventDefault();
    const { name, sets, reps, weight } = newExercise;
    const parsedSets = Math.max(1, parseInt(sets) || 0);
    const parsedReps = Math.max(1, parseInt(reps) || 0);
    const parsedWeight = Math.max(0, parseInt(weight) || 0);

    if (!name || !parsedSets || !parsedReps) return;
    if (!name || parsedSets === 0 || parsedReps === 0) return;

    const newSets = Array.from({ length: parsedSets }, (_, i) => ({
      weight: parsedWeight,
      reps: parsedReps,
      setNumber: i + 1,
    }));

    try {
      await addOrUpdateExerciseLog(
        currentUser.uid,
        {
          name,
          sets: newSets,
        },
        selectedDate
      );
      setNewExercise({ name: "", sets: "", reps: "", weight: "" });
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  const handleQuickAdd = (exerciseId, e) => {
    e?.stopPropagation();

    if (quickAddForm.exerciseId === exerciseId) {
      setQuickAddForm({
        exerciseId: null,
        name: "",
        sets: "",
        reps: "",
        weight: "",
      });
    } else {
      const selectedExercise = exerciseLibrary.find(
        (ex) => ex.id === exerciseId
      ) || { name: "Unknown exercise" };

      setQuickAddForm({
        exerciseId,
        name: selectedExercise.name,
        sets: "3",
        reps: "8",
        weight: "0",
      });
    }
  };

  const handleQuickAddSubmit = async (e, exercise) => {
    e.preventDefault();

    const { sets, reps, weight } = quickAddForm;
    const parsedSets = Math.max(1, parseInt(sets) || 0);
    const parsedReps = Math.max(1, parseInt(reps) || 0);
    const parsedWeight = Math.max(0, parseInt(weight) || 0);

    // Validation
    if (parsedSets === 0 || parsedReps === 0) {
      alert("Sets and reps must be at least 1");
      return;
    }

    const newSets = Array.from({ length: parsedSets }, (_, i) => ({
      weight: parsedWeight,
      reps: parsedReps,
      setNumber: i + 1,
    }));

    try {
      await addOrUpdateExerciseLog(
        currentUser.uid,
        {
          name: exercise.name,
          sets: newSets,
        },
        selectedDate
      );

      setQuickAddForm({
        exerciseId: null,
        name: "",
        sets: "",
        reps: "",
        weight: "",
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  const handleDeleteSet = async (exerciseId, setNumber) => {
    try {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const updatedSets = exercise.sets
        .filter((set) => set.setNumber !== setNumber)
        .map((set, idx) => ({ ...set, setNumber: idx + 1 }));

      if (updatedSets.length === 0) {
        await deleteExerciseLog(exerciseId);
      } else {
        await updateExerciseSets(exerciseId, updatedSets);
      }
    } catch (error) {
      console.error("Error deleting set:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Form Card */}
      <Card className="bg-white dark:bg-zinc-800 shadow-sm border-0 rounded-xl overflow-hidden">
        <CardHeader className="py-3 lg:py-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Exercise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddExercise}
            className="grid gap-4 md:grid-cols-4 "
          >
            <Input
              type="text"
              placeholder="Exercise name"
              value={newExercise.name}
              onChange={(e) =>
                setNewExercise((prev) => ({ ...prev, name: e.target.value }))
              }
              className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-transparent"
            />
            <Input
              type="number"
              min="1"
              placeholder="Sets"
              value={newExercise.sets}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) >= 0) {
                  setNewExercise((prev) => ({ ...prev, sets: value }));
                }
              }}
              className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-transparent"
            />
            <Input
              type="number"
              min="1"
              placeholder="Reps per set"
              value={newExercise.reps}
              onChange={(e) =>
                setNewExercise((prev) => ({ ...prev, reps: e.target.value }))
              }
              className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-transparent"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Weight (lbs)"
                value={newExercise.weight}
                onChange={(e) =>
                  setNewExercise((prev) => ({
                    ...prev,
                    weight: e.target.value,
                  }))
                }
                className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-transparent"
              />
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Exercise List Card */}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Exercise List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LuDumbbell className="h-5 w-5 text-blue-500" />
            Today's Workout
          </h2>

          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="bg-white dark:bg-zinc-800 shadow-sm border-0 rounded-xl overflow-hidden"
            >
              <div>
                <button
                  onClick={() => toggleExercise(exercise.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <LuDumbbell className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {exercise.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {exercise.sets.length} sets
                    </span>
                  </div>
                  {expandedExercises.includes(exercise.id) ? (
                    <LuChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <LuChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedExercises.includes(exercise.id) && (
                  <div className="p-4 space-y-2 bg-gray-50 dark:bg-zinc-800/50">
                    {exercise.sets.map((set, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-4 bg-white dark:bg-zinc-700/50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Set {set.setNumber}
                        </span>
                        <div className="flex items-end space-x-6">
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Weight
                            </span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {set.weight} lbs
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Reps
                            </span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {set.reps}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Volume
                            </span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {set.weight * set.reps} lbs
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteSet(exercise.id, set.setNumber)
                            }
                            className="text-red-500   p-1 hover:text-red-400"
                          >
                            <LuTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
        {/* Exercise Library */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LuBook className="h-5 w-5 text-purple-500" />
              Exercise Library
            </h2>
            <div className="relative w-64">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  setCurrentPage(1); 
                  setExpandedLibraryItem(null); 
                }}
           
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-transparent"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <VirtualizedExerciseList
              key={`exercise-list-${searchQuery}`} 
              exercises={filteredExercises}
              expandedLibraryItem={expandedLibraryItem}
              setExpandedLibraryItem={setExpandedLibraryItem}
              quickAddForm={quickAddForm}
              setQuickAddForm={setQuickAddForm}
              handleQuickAdd={handleQuickAdd}
              handleQuickAddSubmit={handleQuickAddSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
