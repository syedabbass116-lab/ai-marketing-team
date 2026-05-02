import { useState, useRef } from "react";
import { Mail, User as UserIcon, Check, Loader2, Camera, Upload } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import chefDoodle from "../../ChefDoodle.png";

export default function Profile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");

  if (!user) {
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
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });
      if (error) throw error;
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

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update user metadata immediately
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image. Make sure you have an 'avatars' bucket in Supabase.");
    } finally {
      setIsUploading(false);
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
              <div className="w-32 h-32 rounded-full border-2 border-white/10 p-1 overflow-hidden bg-white/5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-white/5">
                    <img src={chefDoodle} alt="Default Avatar" className="w-full h-full object-cover opacity-50" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-bold text-white">{fullName || "User"}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Account Status</span>
                <span className="text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Joined</span>
                <span className="text-white/80">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
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
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-white/40 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-gray-600 italic">Email management is handled via account security settings.</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving || (fullName === user?.user_metadata?.full_name && avatarUrl === user?.user_metadata?.avatar_url)}
                  className={saveSuccess ? "!bg-green-600 border-green-600 text-white" : ""}
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

