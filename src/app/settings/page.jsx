'use client';
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileSettings } from "@/components/ProfileSettings";
import { MetricsForm } from "@/components/MetricsForm";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { User, Settings, BarChart2, X, UserCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [openMetricsDialog, setOpenMetricsDialog] = useState(false);
  const { currentUser } = useAuth();
  
  const getUserInitials = () => {
    if (!currentUser?.displayName) return "U";
    return currentUser.displayName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: UserCircle,
      component: ProfileSettings
    },

  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 ">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 ">
        <div className="max-w-5xl mx-auto dark:bg-zinc-800 rounded-lg shadow-md   border-zinc-700 backdrop-blur-lg">
          <div className="grid md:grid-cols-[240px_1fr] gap-8  ">
            <div className="w-full py-6 px-3 border-r border-zinc-700">
              <div className="flex items-center justify-center mb-10 ">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {getUserInitials()}
                  </span>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="space-y-1.5 mb-6">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id
                      ? "bg-zinc-700/80 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
                
                <button
                  onClick={() => setOpenMetricsDialog(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-zinc-700/50"
                >
                  <Activity className="h-5 w-5" />
                  Update Metrics
                </button>
              </div>
            
             
            </div>

            <div className="space-y-6">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={openMetricsDialog} onOpenChange={setOpenMetricsDialog}>
        <DialogContent hideClose={true} className="dark:bg-zinc-900 border border-zinc-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold dark:text-white">
                <Activity className="h-5 w-5 text-purple-400" />
                Update Health Metrics
              </DialogTitle>
              <DialogClose asChild>
                <Button
                  variant=""
                  size="icon"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <DialogDescription>
              Please update your health metrics below to calculate your recommended daily calorie intake.
            </DialogDescription>
          </DialogHeader>
          <MetricsForm onSubmit={() => setOpenMetricsDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}