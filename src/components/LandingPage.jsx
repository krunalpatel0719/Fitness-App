import { LuDumbbell } from "react-icons/lu";

import React, { useState } from "react";

import Link from "next/link";

export  function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      <nav className="bg-white dark:bg-zinc-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <LuDumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <h1 className="pl-2 sm:pl-4 text-lg sm:text-xl md:text-2xl font-bold leading-none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Krunal's Fitness App
                </h1>
             
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="rounded-full bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Cards */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                <LuDumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Track Workouts</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Log your exercises, sets, and reps with our intuitive workout tracker.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mb-4">
                <LuDumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nutrition Log</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your daily calorie intake and macronutrient balance.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                <LuDumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Progress Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualize your fitness journey with detailed progress charts.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start Your Fitness Journey Today</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Track your progress, achieve your goals, and transform your life.
            </p>
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors inline-block"
            >
              Join Now
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

