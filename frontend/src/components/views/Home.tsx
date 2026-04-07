import { Sparkles, ArrowRight, BarChart3, Calendar, FolderOpen } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

type HomeProps = {
  onStartGenerate: () => void;
  onOpenLibrary: () => void;
  onOpenAnalytics: () => void;
};

export default function Home({
  onStartGenerate,
  onOpenLibrary,
  onOpenAnalytics,
}: HomeProps) {
  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
        <div className="max-w-3xl mx-auto space-y-4 py-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Marketing Agent
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Create high-performing post
          </h1>
          <p className="text-gray-400 text-base">
            Generate posts, schedule content, check analytics all at one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 justify-center">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={onStartGenerate}
            >
              Generate your first post
            </Button>
            <Button variant="secondary" size="lg" onClick={onOpenLibrary}>
              Open Content Library
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <div className="space-y-2">
            <FolderOpen className="w-5 h-5 text-gray-300" />
            <h3 className="text-white font-semibold">Manage Content</h3>
            <p className="text-gray-400 text-sm">
              Save and reuse your best-performing post ideas.
            </p>
          </div>
        </Card>
        <Card hover>
          <div className="space-y-2">
            <Calendar className="w-5 h-5 text-gray-300" />
            <h3 className="text-white font-semibold">Plan Schedule</h3>
            <p className="text-gray-400 text-sm">
              Organize what to publish and when across channels.
            </p>
          </div>
        </Card>
        <Card hover>
          <div className="space-y-2">
            <BarChart3 className="w-5 h-5 text-gray-300" />
            <h3 className="text-white font-semibold">Track Insights</h3>
            <p className="text-gray-400 text-sm">
              Review trends and improve your strategy over time.
            </p>
            <Button variant="ghost" size="sm" onClick={onOpenAnalytics}>
              View analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
