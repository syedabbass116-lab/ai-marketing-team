import { Sparkles, ArrowRight, FolderOpen } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useAuth } from "../../context/AuthContext";

type HomeProps = {
  onStartGenerate: () => void;
  onOpenLibrary: () => void;
};

export default function Home({ onStartGenerate, onOpenLibrary }: HomeProps) {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || "";
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email?.split('@')[0] || "there");
  const username = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 p-1 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {firstName}!
            </h1>
          </div>
          <p className="text-gray-400 text-center max-w-md">
            Ready to create amazing content together?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="w-5 h-5" />}
                onClick={onStartGenerate}
                className="w-full"
              >
                Generate New Post
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<FolderOpen className="w-5 h-5" />}
                onClick={onOpenLibrary}
                className="w-full"
              >
                Content Library
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Content</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Posts Generated</span>
                <span className="text-2xl font-bold text-white">24</span>
              </div>
              <div className="text-sm text-gray-400">This month</div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Content Saved</span>
                <span className="text-2xl font-bold text-white">156</span>
              </div>
              <div className="text-sm text-gray-400">In library</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Brand Voice</h3>
            <div className="text-sm text-gray-400 mb-2">Current style</div>
            <div className="text-xl font-semibold text-white">Professional</div>
            <Button variant="secondary" size="md" className="w-full">
              Customize Brand Settings
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
