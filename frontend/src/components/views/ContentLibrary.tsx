import { useState } from "react";
import { Copy, Trash2, Calendar, CheckCircle } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

type ContentItem = {
  id: string;
  platform: string;
  text: string;
  timestamp?: string;
};

type Props = {
  library: ContentItem[];
  onDelete?: (id: string) => void;
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "bg-blue-900/30 text-blue-300 border-blue-700",
  twitter: "bg-sky-900/30 text-sky-300 border-sky-700",
  threads: "bg-zinc-900/30 text-zinc-300 border-zinc-700",
};

const PLATFORMS = ["linkedin", "twitter", "threads"];

const PLATFORM_NAMES: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  threads: "Threads",
};

export default function ContentLibrary({ library, onDelete }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = library.filter((item) => {
    const matchesSearch = item.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPlatform = !selectedPlatform || item.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const platformCounts = PLATFORMS.reduce(
    (acc, platform) => {
      acc[platform] = library.filter((item) => item.platform === platform).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Content Library</h1>
          <p className="text-gray-400 text-sm">
            Save and manage your best posts across all platforms
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => setSelectedPlatform(null)}
            className={selectedPlatform === null ? "bg-white/10" : ""}
          >
            All ({(library?.length ?? 0)})
          </Button>
        </div>
      </div>

      {/* Platform filter tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-white/10">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            onClick={() =>
              setSelectedPlatform(selectedPlatform === platform ? null : platform)
            }
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
              selectedPlatform === platform
                ? PLATFORM_COLORS[platform]
                : "bg-white/5 border-white/10 text-white/60 hover:text-white/80 hover:border-white/20"
            }`}
          >
            {PLATFORM_NAMES[platform] || platform} {platformCounts[platform] > 0 && `(${platformCounts[platform]})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {library.length === 0 && (
        <div className="py-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No posts saved yet</p>
          <p className="text-gray-500 text-sm">
            Generate content and save your favorite posts to see them here
          </p>
        </div>
      )}

      {/* Posts grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="relative group hover:border-white/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded border ${PLATFORM_COLORS[item.platform] || "bg-gray-900/30 text-gray-300 border-gray-700"}`}
                    >
                      {PLATFORM_NAMES[item.platform] || item.platform}
                    </span>
                    {item.created_at && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-sm leading-relaxed break-words line-clamp-3">
                    {item.text}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(item.text)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {deleteConfirm === item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-1 rounded text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 rounded text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-600/20 text-white/60 hover:text-red-400 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filtered empty state */}
      {library.length > 0 && filtered.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-400 mb-2">No posts found</p>
          <p className="text-gray-500 text-sm">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
