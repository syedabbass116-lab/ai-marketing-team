import { TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive?: boolean;
}

function MetricCard({ title, value, change, icon, positive = true }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
          <p className={`text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {change} vs last month
          </p>
        </div>
        <div className="p-3 bg-gray-800 rounded-lg">{icon}</div>
      </div>
    </Card>
  );
}

interface TopPost {
  id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  content: string;
  engagement: number;
  reach: number;
  date: string;
}

const topPosts: TopPost[] = [
  {
    id: '1',
    platform: 'instagram',
    content: 'Transform your mindset, transform your life ✨',
    engagement: 2850,
    reach: 15200,
    date: '2024-03-13',
  },
  {
    id: '2',
    platform: 'linkedin',
    content: '🚀 Building a successful startup requires...',
    engagement: 1680,
    reach: 8900,
    date: '2024-03-15',
  },
  {
    id: '3',
    platform: 'twitter',
    content: 'The secret to productivity? Start with just 5 minutes...',
    engagement: 1420,
    reach: 12400,
    date: '2024-03-14',
  },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Track your content performance across all platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Engagement"
          value="24.5K"
          change="+18.2%"
          icon={<Heart className="w-6 h-6 text-pink-400" />}
        />
        <MetricCard
          title="Total Reach"
          value="156K"
          change="+24.1%"
          icon={<Eye className="w-6 h-6 text-blue-400" />}
        />
        <MetricCard
          title="Comments"
          value="3.2K"
          change="+12.5%"
          icon={<MessageCircle className="w-6 h-6 text-green-400" />}
        />
        <MetricCard
          title="Shares"
          value="1.8K"
          change="+31.4%"
          icon={<Share2 className="w-6 h-6 text-purple-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Engagement Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Week 1</span>
              <div className="flex-1 mx-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-sm text-white font-medium">6.5K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Week 2</span>
              <div className="flex-1 mx-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-sm text-white font-medium">7.5K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Week 3</span>
              <div className="flex-1 mx-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '55%' }}></div>
              </div>
              <span className="text-sm text-white font-medium">5.5K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Week 4</span>
              <div className="flex-1 mx-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-sm text-white font-medium">8.5K</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="instagram">INSTAGRAM</Badge>
                <span className="text-sm text-white font-medium">42%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="linkedin">LINKEDIN</Badge>
                <span className="text-sm text-white font-medium">28%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="twitter">TWITTER</Badge>
                <span className="text-sm text-white font-medium">20%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="tiktok">TIKTOK</Badge>
                <span className="text-sm text-white font-medium">10%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Top Performing Posts</h3>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div className="space-y-4">
          {topPosts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={post.platform}>{post.platform.toUpperCase()}</Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{post.content}</p>
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Heart className="w-3 h-3" />
                    <span>{post.engagement.toLocaleString()} engagements</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Eye className="w-3 h-3" />
                    <span>{post.reach.toLocaleString()} reach</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
