import { useUser } from "@clerk/clerk-react";
import { useState, useRef } from "react";
import { Camera, Mail, User as UserIcon, Check, Loader2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await user.update({
        firstName,
        lastName,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      await user.setProfileImage({ file });
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile information and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="flex flex-col items-center text-center py-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-2 border-white/10 p-1 group-hover:border-white/30 transition-all duration-300">
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover shadow-2xl"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.primaryEmailAddress?.emailAddress}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Account Status</span>
                <span className="text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Member Since</span>
                <span className="text-white/80">{new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-white/5 rounded-lg">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="email" 
                    value={user.primaryEmailAddress?.emailAddress} 
                    disabled 
                    className="w-full bg-white/5 border border-white/5 rounded-lg pl-11 pr-4 py-3 text-white/40 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-600 italic">Primary email cannot be changed here.</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSaving || (firstName === user.firstName && lastName === user.lastName)}
                  className={saveSuccess ? "bg-green-600 border-green-600 text-white" : ""}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Changes Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Card>


        </div>
      </div>
    </div>
  );
}
