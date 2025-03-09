import { LuDumbbell, LuApple, LuCalendar, LuNotebookPen } from "react-icons/lu";

import React, { useState } from "react";

import Link from "next/link";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      <nav className="bg-white dark:bg-zinc-800 shadow-lg">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <LuDumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <h1 className="pl-2 sm:pl-4 text-lg sm:text-xl md:text-2xl font-bold leading-none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Krunal's Fitness App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/fooddiary"
                className="rounded-full bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Track Your Nutrition
            <span className="block text-blue-600 font-medium">
              Achieve Your Goals
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your personal nutrition coach. Log meals, track macros, and reach
            your fitness goals with our intuitive food diary.
          </p>
          <a
            href="/fooddiary"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors inline-block"
          >
            Start Your Journey
          </a>
        </div>

        <div className="grid gap-6 md:gap-12 md:grid-cols-3">
          <div className=" bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <LuNotebookPen  className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Food Logging
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quickly log meals with our extensive food database and smart
                suggestions.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 mb-4">
                <LuApple className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Macro Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your protein, carbs, and fats with detailed nutritional
                insights.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
                <LuDumbbell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Track Workouts
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Log your exercises, sets, and reps with our intuitive workout
                tracker.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-8">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <LuCalendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your nutrition and fitness journey with detailed progress
                analytics.
              </p>
            </div>
          </div>

         
        </div>
      </main>
    </div>
  );
}

