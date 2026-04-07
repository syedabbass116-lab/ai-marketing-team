import { Sparkles, Copy, RefreshCw, Save } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Badge from "../ui/Badge";

// ✅ Proper type
type ContentType = {
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
};

type DashboardProps = {
  content: ContentType | null;
  loading: boolean;
  error?: string | null;
  topic: string;
  onTopicChange: (value: string) => void;
  platform: string;
  onPlatformChange: (value: string) => void;
  onGenerate: (topic: string, platform: string) => void;
  onSave: (platform: string, text: string) => void;
};

export default function Dashboard({
  content,
  loading,
  error,
  topic,
  onTopicChange,
  platform,
  onPlatformChange,
  onGenerate,
  onSave,
}: DashboardProps) {
  const platformOptions = [
    { value: "all", label: "All Platforms" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;
    onGenerate(topic, platform);
  };

  const formattedContent = content;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Turn 1 Idea into 10 High-Performing Posts
        </h1>
        <p className="text-gray-400">
          Generate content for all your platforms in seconds
        </p>
      </div>

      {/* INPUT */}
      <Card>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter your topic or idea..."
            rows={4}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
          />

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <Select
                options={platformOptions}
                value={platform}
                onChange={(e) => onPlatformChange(e.target.value)}
              />
            </div>

            <Button
              variant="primary"
              className="w-full md:w-auto"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Content"}
            </Button>
          </div>
        </div>
      </Card>

      {/* LOADING */}
      {loading && (
        <Card>
          <div className="animate-pulse text-gray-400">
            Generating content...
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <div className="text-red-400">Failed to generate content: {error}</div>
        </Card>
      )}

      {/* GENERATED CONTENT */}
      {formattedContent && !loading && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Generated Content
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(formattedContent)
              .filter(
                ([_, text]) => typeof text === "string" && text.trim() !== "",
              )
              .map(([platformKey, text]) => (
                <Card key={platformKey} hover>
                  <div className="space-y-4">
                    <Badge variant={platformKey as any}>
                      {platformKey.toUpperCase()}
                    </Badge>

                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {text}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Copy className="w-4 h-4" />}
                        onClick={() => handleCopy(text)}
                      >
                        Copy
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Save className="w-4 h-4" />}
                        onClick={() => onSave(platformKey, text)}
                      >
                        Save
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<RefreshCw className="w-4 h-4" />}
                        onClick={handleGenerate}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!formattedContent && !loading && (
        <Card>
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No content generated yet
            </h3>
            <p className="text-gray-400">Enter a topic and generate content</p>
          </div>
        </Card>
      )}
    </div>
  );
}
