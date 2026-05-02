import { Check, CreditCard, Download, Zap } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useUsageLimit } from '../../hooks/useUsageLimit';

interface ContentItem {
  id: string;
  platform: string;
  text: string;
  timestamp?: string;
}

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  postsPerMonth: number;
  platforms: number;
  features: string[];
  current?: boolean;
  popular?: boolean;
}

function PlanCard({ name, price, period, postsPerMonth, platforms, features, current, popular }: PlanCardProps) {
  return (
    <Card className={popular ? 'border-white/30' : ''}>
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span
            style={{ fontFamily: 'var(--font-heading)' }}
            className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full tracking-widest"
          >
            POPULAR
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3
          style={{ fontFamily: 'var(--font-heading)' }}
          className="text-base font-bold text-white mb-1 tracking-tight"
        >
          {name}
        </h3>
        <div className="mb-4 mt-3">
          <span className="text-4xl font-black text-white">{price}</span>
          <span className="text-xs text-white/30 ml-1">/{period}</span>
        </div>
        <Button
          variant={current ? 'secondary' : 'primary'}
          className="w-full"
          disabled={current}
        >
          {current ? 'Current Plan' : 'Upgrade'}
        </Button>
      </div>

      {/* Key metrics */}
      <div className="space-y-3 mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-white/60" />
          <span className="text-sm font-semibold text-white">{postsPerMonth}</span>
          <span className="text-xs text-white/50">posts/month</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-white/60" />
          <span className="text-sm font-semibold text-white">{platforms}</span>
          <span className="text-xs text-white/50">platforms</span>
        </div>
      </div>

      <ul className="space-y-2.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-xs text-white/50">
            <Check className="w-3.5 h-3.5 text-white/60 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const PLATFORM_NAMES: Record<string, string> = {
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-900/30 text-blue-300',
  twitter: 'bg-sky-900/30 text-sky-300',
  instagram: 'bg-pink-900/30 text-pink-300',
  facebook: 'bg-indigo-900/30 text-indigo-300',
  tiktok: 'bg-purple-900/30 text-purple-300',
  youtube: 'bg-red-900/30 text-red-300',
};

interface BillingProps {
  library?: ContentItem[];
  usage?: any;
  trialDaysLeft?: number;
  hasTrialExpired?: boolean;
}

export default function Billing({ 
  library = [], 
  usage, 
  trialDaysLeft, 
  hasTrialExpired 
}: BillingProps) {

  // Calculate real usage from library
  const platformUsage: Record<string, number> = {
    linkedin: 0,
    twitter: 0,
    instagram: 0,
    facebook: 0,
    tiktok: 0,
    youtube: 0,
  };

  library.forEach((item) => {
    if (platformUsage.hasOwnProperty(item.platform)) {
      platformUsage[item.platform]++;
    }
  });

  const libraryTotal = Object.values(platformUsage).reduce((sum, count) => sum + count, 0);
  const totalUsed = usage?.posts_generated ?? libraryTotal;
  const monthlyLimit = usage?.is_pro ? 1000 : 50; // Dynamic limit based on plan
  const percentUsed = Math.min(100, Math.round((totalUsed / monthlyLimit) * 100));

  const platformList = Object.entries(platformUsage).map(([key, count]) => ({
    name: PLATFORM_NAMES[key] || key,
    platform: key,
    used: count,
    color: PLATFORM_COLORS[key] || 'bg-gray-900/30 text-gray-300',
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Billing & Usage</h1>
          <p className="text-sm text-white/40">Track your posts and platform usage</p>
        </div>
        {!usage?.is_pro && (
          <div className="text-right">
            <span className={`text-[10px] px-2 py-1 rounded tracking-widest uppercase font-bold ${hasTrialExpired ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
              {hasTrialExpired ? 'Trial Expired' : `Trial: ${trialDaysLeft} days left`}
            </span>
          </div>
        )}
      </div>

      {/* Current Usage Overview */}
      <Card className="border-white/20">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">Posts Generated This Month</h3>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-4xl font-black text-white">{totalUsed}</div>
              <div className="text-xs text-white/50">of {monthlyLimit} available</div>
            </div>
            <div className="flex-1">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="text-xs text-white/50 mt-2">{percentUsed}% used</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-4">Usage by Platform</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platformList.map((platform) => (
            <div
              key={platform.platform}
              className={`p-3 rounded-lg border border-white/10 ${platform.color}`}
            >
              <div className="text-xs font-semibold mb-1">{platform.name}</div>
              <div className="text-lg font-bold">{platform.used}</div>
              <div className="text-[10px] opacity-70">posts</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <PlanCard
            name="Starter"
            price="$29"
            period="month"
            postsPerMonth={50}
            platforms={3}
            features={[
              'LinkedIn, Twitter, Instagram',
              'Monthly post limit',
              'Content library storage',
              'Email support',
            ]}
          />
          <PlanCard
            name="Professional"
            price="$79"
            period="month"
            postsPerMonth={200}
            platforms={6}
            popular
            current
            features={[
              'All 6 platforms',
              'Monthly post limit',
              'Content library storage',
              'Priority support',
              'Export posts',
            ]}
          />
          <PlanCard
            name="Enterprise"
            price="$199"
            period="month"
            postsPerMonth={500}
            platforms={6}
            features={[
              'All platforms unlimited',
              'No monthly limits',
              'Advanced content library',
              'Dedicated support',
              'Custom integrations',
              'Team management',
            ]}
          />
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-4">
          Payment Method
        </h3>
        <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Visa ending in 4242</p>
              <p className="text-xs text-white/30">Expires 12/2025</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
        <Button variant="secondary" size="sm">Add Payment Method</Button>
      </Card>

      {/* Billing History */}
      <Card>
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-4">
          Billing History
        </h3>
        <div className="space-y-2">
          {[
            { date: 'Mar 1, 2024', amount: '$79.00', status: 'Paid' },
            { date: 'Feb 1, 2024', amount: '$79.00', status: 'Paid' },
            { date: 'Jan 1, 2024', amount: '$79.00', status: 'Paid' },
          ].map((invoice, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{invoice.date}</p>
                <p className="text-xs text-white/30">Professional Plan</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-white">{invoice.amount}</span>
                <span className="text-[10px] px-2 py-1 bg-white/10 text-white/60 rounded tracking-widest uppercase">
                  {invoice.status}
                </span>
                <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />}>
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
