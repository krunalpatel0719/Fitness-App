"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MetricsForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState(
    initialData || {
      feet: "",
      inches: "",
      weight: "",
      age: "",
      gender: "male",
      activityLevel: "sedentary",
      goal: "maintain",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      feet: parseFloat(formData.feet),
      inches: parseFloat(formData.inches),
      weight: parseFloat(formData.weight),
      age: parseFloat(formData.age),
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      goal: formData.goal
    };
    onSubmit(processedData);
  };

  return (
    <div className="w-full ">
      <CardContent className="p-4 ">
        <div className="grid gap-8 ">
    
          
            
            <form onSubmit={handleSubmit} className="space-y-6">
             
              <div className = "bg-gray-200/70 dark:bg-zinc-800/70 p-4 rounded-lg" >
                <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-black dark:text-white">Body Metrics</h2>
               </div>
              {/* Height Section with Feet and Inches */}
              <div className="grid grid-cols-2 gap-4 mb-4 ">
                <div className="space-y-2">
                  <Label htmlFor="feet" className="text-zinc-400">Height (ft)</Label>
                  <Input 
                    id="feet"
                    type="number" 
                    placeholder="5"
                    required
                    value={formData.feet}
                    onChange={(e) => setFormData({ ...formData, feet: e.target.value })}
                    className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inches" className="text-zinc-400">Height (in)</Label>
                  <Input 
                    id="inches"
                    type="number" 
                    placeholder="10"
                    required
                    value={formData.inches}
                    onChange={(e) => setFormData({ ...formData, inches: e.target.value })}
                    className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white"
                  />
                </div>
              </div>
              
              {/* Weight Field */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="weight" className="text-zinc-400">Weight (lb)</Label>
                <Input 
                  id="weight"
                  type="number" 
                  placeholder="165" 
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white"
                />
              </div>
              
              {/* Age Field */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="age" className="text-zinc-400">Age</Label>
                <Input 
                  id="age"
                  type="number" 
                  placeholder="30" 
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white"
                />
              </div>
              
              {/* Gender Select */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="gender" className="text-zinc-400">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="gender" className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-200 dark:bg-zinc-800 border-zinc-700">
                    <SelectItem value="male" className="text-black dark:text-white">Male</SelectItem>
                    <SelectItem value="female" className="text-black dark:text-white">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Activity Level Select */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="activity-level" className="text-zinc-400">Activity Level</Label>
                <Select 
                  value={formData.activityLevel} 
                  onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                >
                  <SelectTrigger id="activity-level" className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-200 dark:bg-zinc-800 border-zinc-700">
                    <SelectItem value="sedentary" className="text-black dark:text-white">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="lightlyActive" className="text-black dark:text-white">Lightly active (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="active" className="text-black dark:text-whitee">Moderately active (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="veryActive" className="text-black dark:text-white">Very active (hard exercise 6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Goal Select */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="goal" className="text-zinc-400">Goal</Label>
                <Select 
                  value={formData.goal} 
                  onValueChange={(value) => setFormData({ ...formData, goal: value })}
                >
                  <SelectTrigger id="goal" className="bg-gray-200 dark:bg-zinc-800 border-zinc-700 text-black dark:text-white">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-200 dark:bg-zinc-800 border-zinc-700">
                    <SelectItem value="lose" className="text-black dark:text-white">Lose Weight</SelectItem>
                    <SelectItem value="maintain" className="text-black dark:text-white">Maintain Weight</SelectItem>
                    <SelectItem value="gain" className="text-black dark:text-white">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Calculate My Calories
              </Button>
            </form>
   
        </div>
      </CardContent>
    </div>
  );
}