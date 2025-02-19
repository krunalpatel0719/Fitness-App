"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { MetricsForm } from "@/components/MetricsForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { FiUser, FiSettings, FiBarChart2, FiX } from "react-icons/fi";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [openMetricsDialog, setOpenMetricsDialog] = useState(false);
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleMetricsSubmit = async (metrics) => {
    try {
      const bmr = calculateCalories(metrics);
      await setDoc(doc(db, "user_metrics", currentUser.uid), {
        ...metrics,
        dailyCalories: bmr,
        userId: currentUser.uid,
        updatedAt: new Date()
      });
      setOpenMetricsDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving metrics:", error);
    }
  };

  const calculateCalories = (metrics) => {
    // Convert weight from lbs to kg
    const weightKg = parseFloat(metrics.weight) * 0.453592;
    // Convert height from feet/inches to centimeters
    const heightCm = (parseFloat(metrics.feet) * 30.48) + (parseFloat(metrics.inches) * 2.54);
    
    // Mifflin-St Jeor Equation
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * parseFloat(metrics.age));
    bmr += metrics.gender === 'male' ? 5 : -161;

    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      active: 1.55,
      veryActive: 1.725
    };

    const tdee = bmr * activityMultipliers[metrics.activityLevel];

    switch (metrics.goal) {
      case 'lose': return Math.round(tdee - 500);
      case 'gain': return Math.round(tdee + 500);
      default: return Math.round(tdee);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-zinc-900">
      <Navbar />
      <main className="flex-1 p-4 md:p-8">
        <div className="container max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[250px_1fr] gap-6">
            <Card className="dark:bg-zinc-800 p-4 h-fit">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "profile" ? "primary" : "ghost"}
                  className={`w-full justify-start flex items-center gap-2 ${activeTab === "profile" ? "text-blue-500" : "dark:text-gray-100 focus:text-blue-500"}`}
                  
                  onClick={() => setActiveTab("profile")}
                >
                  <FiUser className="text-lg" />
                  Profile
                </Button>
                <Button
                  variant={activeTab === "preferences" ? "primary" : "ghost"}
                  className={`w-full justify-start flex items-center gap-2  ${activeTab === "preferences" ? "text-blue-500" : " dark:text-gray-100 focus:text-blue-500"}`}
                  
                  onClick={() => setActiveTab("preferences")}
                >
                  <FiSettings className="text-lg" />
                  Preferences
                </Button>
                <Button
                  variant={openMetricsDialog == true ? "primary" : "ghost"}
                  className="w-full justify-start flex items-center gap-2 dark:text-gray-100 focus:text-blue-500"
                  onClick={() => setOpenMetricsDialog(true)}
                >
                  <FiBarChart2 className="text-lg" />
                  Update Metrics
                </Button>
              </nav>
            </Card>

            {/* Main Content */}
            <Card className="dark:bg-zinc-800 p-6">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-bold dark:text-white mb-4">
                    Profile Settings
                  </h2>
                  <p className="dark:text-gray-300">
                    Profile content goes here...
                  </p>
                </div>
              )}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-xl font-bold dark:text-white mb-4">
                    Preferences
                  </h2>
                  <p className="dark:text-gray-300">
                    Preferences content goes here...
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>s

      {/* Metrics Update Dialog */}
      <Dialog  open={openMetricsDialog} onOpenChange={setOpenMetricsDialog} >
        <DialogContent hideClose = {true} className="max-w-2xl mx-auto dark:bg-zinc-800 p-6 mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white flex items-center justify-between">
              Update Health Metrics
              <DialogClose asChild>
                <Button  className="text-xl p-1 bg-transparent hover:text-red-500 hover:opacity-100 transition-none hover:bg-transparent">
                  <FiX />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Please update your health metrics below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <MetricsForm onSubmit={handleMetricsSubmit} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
