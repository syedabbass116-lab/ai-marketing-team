import { Heart, MessageCircle, Share2, MoreHorizontal, Search } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import chefDoodle from "../../ChefDoodle.png";

interface PlatformPreviewProps {
  platform: string;
  content: string;
}

export default function PlatformPreview({ platform, content }: PlatformPreviewProps) {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User Name';
  const userHandle = user?.email?.split('@')[0] || 'username';
  const avatarUrl = user?.user_metadata?.avatar_url || chefDoodle;

  const truncateText = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  };

  if (platform === 'linkedin') {
    return (
      <div className="bg-white text-black rounded-lg overflow-hidden border border-gray-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{userName}</div>
              <div className="text-xs text-gray-600">Professional · 2nd</div>
              <div className="text-xs text-gray-600">2 days ago</div>
            </div>
            <button className="text-gray-600 hover:text-gray-900">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* Stats */}
        <div className="px-4 py-3 text-xs text-gray-600 border-b border-gray-200 flex justify-between">
          <div>👍 124 reactions</div>
          <div>2 comments · 5 reposts</div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 flex justify-around text-gray-600">
          <button className="flex items-center gap-2 text-sm hover:text-blue-600 flex-1 justify-center py-2">
            <Heart size={18} />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-blue-600 flex-1 justify-center py-2 border-l border-gray-200">
            <MessageCircle size={18} />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-blue-600 flex-1 justify-center py-2 border-l border-gray-200">
            <Share2 size={18} />
            <span>Repost</span>
          </button>
        </div>
      </div>
    );
  }

  if (platform === 'twitter') {
    const charLimit = 280;
    const charCount = content.length;
    const isOverLimit = charCount > charLimit;

    return (
      <div className="bg-black text-white rounded-2xl border border-gray-700 overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full border border-gray-700 overflow-hidden flex-shrink-0">
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{userName}</div>
              <div className="text-xs text-gray-500">@{userHandle}</div>
            </div>
            <button className="text-gray-500 hover:text-blue-500">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* Character Count Warning */}
        {isOverLimit && (
          <div className="px-4 py-2 bg-red-900/20 border-t border-red-700 text-xs text-red-400">
            ⚠️ Character limit exceeded: {charCount}/{charLimit}
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-700 flex justify-between">
          <div>💬 12</div>
          <div>🔄 34</div>
          <div>❤️ 89</div>
          <div>📊</div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 flex justify-around text-gray-500 border-t border-gray-700">
          <button className="flex items-center gap-2 text-xs hover:text-blue-400 flex-1 justify-center py-2">
            <MessageCircle size={16} />
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-green-400 flex-1 justify-center py-2">
            <Share2 size={16} />
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-red-400 flex-1 justify-center py-2">
            <Heart size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (platform === 'threads') {
    return (
      <div className="bg-white text-black rounded-2xl border border-gray-200 overflow-hidden w-full max-w-md shadow-sm">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden flex-shrink-0">
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <div className="font-bold text-sm hover:underline cursor-pointer">{userHandle}</div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-xs">2h</span>
                <MoreHorizontal size={16} />
              </div>
            </div>
            
            {/* Content */}
            <div className="text-[15px] leading-normal whitespace-pre-wrap mb-3">
              {content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 text-black mb-3">
              <Heart size={20} className="hover:scale-110 transition-transform cursor-pointer" />
              <MessageCircle size={20} className="hover:scale-110 transition-transform cursor-pointer" />
              <Share2 size={20} className="hover:scale-110 transition-transform cursor-pointer" />
              <Search size={20} className="hover:scale-110 transition-transform cursor-pointer rotate-90" />
            </div>

            {/* Footer Stats */}
            <div className="text-sm text-zinc-400">
              42 replies · 128 likes
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'instagram') {
    return (
      <div className="bg-white text-black rounded-lg border border-gray-300 overflow-hidden w-full max-w-sm">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            </div>
            <div className="text-sm font-semibold">{userHandle}</div>
          </div>
          <MoreHorizontal size={16} />
        </div>

        {/* Image Placeholder */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
          [Image]
        </div>

        {/* Actions */}
        <div className="px-3 py-2 flex gap-3 border-b border-gray-200">
          <button className="hover:opacity-60">
            <Heart size={20} />
          </button>
          <button className="hover:opacity-60">
            <MessageCircle size={20} />
          </button>
          <button className="hover:opacity-60">
            <Share2 size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-3 py-2 text-sm border-b border-gray-200">
          <div className="font-semibold">1,234 likes</div>
        </div>

        {/* Caption */}
        <div className="px-3 py-3 text-sm">
          <div className="mb-2">
            <span className="font-semibold">{userHandle}</span>{' '}
            <span className="whitespace-pre-wrap">{content}</span>
          </div>
          <div className="text-gray-500 text-xs">View all 24 comments</div>
        </div>

        {/* Comment Input */}
        <div className="p-3 border-t border-gray-200 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm bg-transparent outline-none"
          />
          <button className="text-blue-500 font-semibold text-sm">Post</button>
        </div>
      </div>
    );
  }

  if (platform === 'facebook') {
    return (
      <div className="bg-white text-black rounded-lg border border-gray-300 overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold">{userName}</div>
              <div className="text-xs text-gray-600">2 hours ago</div>
            </div>
          </div>
          <MoreHorizontal size={18} />
        </div>

        {/* Content */}
        <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap border-b border-gray-200">
          {content}
        </div>

        {/* Stats */}
        <div className="px-4 py-2 text-xs text-gray-600 border-b border-gray-200 flex justify-between">
          <div>👍 234 people like this</div>
          <div>12 shares</div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 flex justify-around">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 flex-1 justify-center py-2">
            <Heart size={18} />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 flex-1 justify-center py-2 border-l border-gray-200">
            <MessageCircle size={18} />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 flex-1 justify-center py-2 border-l border-gray-200">
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>
    );
  }

  if (platform === 'tiktok') {
    return (
      <div className="bg-black text-white rounded-2xl border border-gray-800 overflow-hidden w-full max-w-sm">
        {/* Video Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center relative">
          <div className="text-4xl mb-2">🎬</div>
          <div className="text-xs text-gray-400">[Video Preview]</div>
        </div>

        {/* Caption and Info */}
        <div className="p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full border border-gray-800 overflow-hidden flex-shrink-0">
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">@{userHandle}</div>
              <div className="text-xs text-gray-400">Followed</div>
            </div>
            <button className="text-red-500 font-semibold">Follow</button>
          </div>

          {/* Caption */}
          <div className="text-sm whitespace-pre-wrap">
            {content}
          </div>

          {/* Trending Hashtag Example */}
          <div className="text-xs text-gray-400">
            #FYP #ForYou #Trending
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-gray-400 pt-2">
            <div>❤️ 1.2M</div>
            <div>💬 245K</div>
            <div>🔄 89K</div>
            <div>📤 12K</div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'youtube') {
    return (
      <div className="bg-white text-black rounded-lg border border-gray-300 overflow-hidden w-full max-w-md">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
          [Video Thumbnail]
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-3">
          <div className="font-bold text-sm">Your Video Title</div>

          {/* Channel Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold">{userName}</div>
                <div className="text-xs text-gray-600">234K subscribers</div>
              </div>
            </div>
            <button className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              Subscribe
            </button>
          </div>

          {/* Description Preview */}
          <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded line-clamp-3 whitespace-pre-wrap">
            {content}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-gray-600">
            <div>👍 45K</div>
            <div>👎 234</div>
            <div>💬 892</div>
            <div>↗️ Share</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded border border-gray-300 text-gray-600">
      Platform preview not available
    </div>
  );
}
