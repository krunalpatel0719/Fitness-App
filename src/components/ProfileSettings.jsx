import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AtSign, User, Camera, Pencil } from "lucide-react";


export function ProfileSettings() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const parseNameParts = () => {
    const displayName = userProfile?.displayName || currentUser?.displayName;
    if (!displayName) return { firstName: '', lastName: '' };
    
    const nameParts = displayName.split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || ''
    };
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || '',
    previewURL: null
  });
  
  useEffect(() => {
    if (currentUser) {
      const { firstName, lastName } = parseNameParts();
      setFormData({
        firstName,
        lastName,
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || userProfile.photoURL || '',
        previewURL: null
      });
    }
  }, [currentUser, userProfile])
 


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);
    try {
      
      
      const displayName = `${formData.firstName} ${formData.lastName}`.trim();
      
      await updateUserProfile({
        displayName,
       
      });
      
     
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 mx-4 md:mr-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white mt-8 mb-1">Profile Settings</h1>
          <p className="text-gray-400">Manage your personal information and account settings</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      <div className=" grid grid-cols-1  gap-6">
     

        {/* Personal Information Section */}
        <Card className="p-6 bg-zinc-900/50 border-0">
          <h2 className="text-lg font-medium text-white mb-4">Personal Information</h2>
          <p className="text-sm text-gray-400 mb-6">Your profile details</p>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-gray-700 text-white"
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-gray-700 text-white"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Email</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={formData.email}
                    disabled
                    className="pl-10 bg-zinc-800/50 border-gray-700 text-gray-400"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isUploading}
                >
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant=""
                  className="flex-1 border-gray-700 dark:text-black dark:bg-zinc-100 hover:bg-zinc-800 hover:dark:bg-zinc-300"
                  onClick={() => {
                    const { firstName, lastName } = parseNameParts();
                    setFormData({
                      firstName,
                      lastName,
                      email: currentUser?.email || '',
                      photoURL: currentUser?.photoURL || '',
                      previewURL: null
                    });
                    setIsEditing(false);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-400">Full Name</h3>
                  <p className="text-white">{`${formData.firstName} ${formData.lastName}`.trim() || 'Not set'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Email</h3>
                  <p className="text-white">{formData.email || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}