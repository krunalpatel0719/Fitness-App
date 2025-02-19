// src/components/ProgressBar.jsx
"use client";

export function ProgressBar({ current, goal }) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={`md:text-lg ${
            isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`} >{current} kcal</span>
        <span className={`md:text-lg ${
            isOver ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>{goal} kcal</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-600">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOver && (
        <div className="text-right text-sm text-red-600 dark:text-red-400">
          Exceeded by {current - goal} kcal
        </div>
      )}
    </div>
  );
}