//src/components/MetricsForm

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    <Card className="dark:bg-zinc-800 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="dark:text-white text-2xl">
          Set Up Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Height inputs: Feet and Inches */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="dark:text-gray-300 text-sm md:text-md">
                Height (ft)
              </Label>
              <Input
                type="number"
                className="focus:border-black"
                required
                value={formData.feet}
                onChange={(e) =>
                  setFormData({ ...formData, feet: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300 text-sm md:text-md">
                Height (in)
              </Label>
              <Input
                type="number"
                className="focus:border-black"
                required
                value={formData.inches}
                onChange={(e) =>
                  setFormData({ ...formData, inches: e.target.value })
                }
              />
            </div>
          </div>

          {/* Weight (lb) */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300 text-sm md:text-md">
              Weight (lb)
            </Label>
            <Input
              type="number"
              className="focus:border-black"
              required
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300 text-sm md:text-md">
              Age
            </Label>
            <Input
              type="number"
              className="focus:border-black"
              required
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300 text-sm md:text-md">
              Gender
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger className="w-full dark:bg-zinc-800 dark:text-white focus:border-blue-500">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-800">
                <SelectItem
                  value="male"
                  className="dark:text-white text-sm md:text-md"
                >
                  Male
                </SelectItem>
                <SelectItem
                  value="female"
                  className="dark:text-white text-sm md:text-md"
                >
                  Female
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300 text-sm md:text-md">
              Activity Level
            </Label>
            <Select
              value={formData.activityLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, activityLevel: value })
              }
            >
              <SelectTrigger className="w-full dark:bg-zinc-800 dark:text-white focus:border-blue-500">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-800">
                <SelectItem
                  value="sedentary"
                  className="dark:text-white text-sm md:text-md"
                >
                  Sedentary
                </SelectItem>
                <SelectItem
                  value="lightlyActive"
                  className="dark:text-white text-sm md:text-md"
                >
                  Lightly Active
                </SelectItem>
                <SelectItem
                  value="active"
                  className="dark:text-white text-sm md:text-md"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="veryActive"
                  className="dark:text-white text-sm md:text-md"
                >
                  Very Active
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label className="dark:text-gray-300 text-sm md:text-md">
              Goal
            </Label>
            <Select
              value={formData.goal}
              onValueChange={(value) =>
                setFormData({ ...formData, goal: value })
              }
            >
              <SelectTrigger className="w-full dark:bg-zinc-800 dark:text-white focus:border-blue-500">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-800">
                <SelectItem
                  value="lose"
                  className="dark:text-white text-sm md:text-md"
                >
                  Lose Weight
                </SelectItem>
                <SelectItem
                  value="maintain"
                  className="dark:text-white text-sm md:text-md"
                >
                  Maintain Weight
                </SelectItem>
                <SelectItem
                  value="gain"
                  className="dark:text-white text-sm md:text-md"
                >
                  Gain Weight
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
            Calculate My Calories
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
