import { Check, CreditCard, Download } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useUsageLimit } from '../../hooks/useUsageLimit';

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  current?: boolean;
  popular?: boolean;
}

function PlanCard({ name, price, period, features, current, popular }: PlanCardProps) {
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
          <span
            className="text-4xl font-black text-white"
          >
            {price}
          </span>
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

export default function Billing() {
  const { usage, trialDaysLeft, hasTrialExpired } = useUsageLimit();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Billing & Plans</h1>
          <p className="text-sm text-white/40">Choose the plan that fits your content needs</p>
        </div>
        {!usage?.is_pro && (
          <div className="text-right">
            <span className={`text-[10px] px-2 py-1 rounded tracking-widest uppercase font-bold ${hasTrialExpired ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
              {hasTrialExpired ? 'Trial Expired' : `Trial: ${trialDaysLeft} days left`}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <PlanCard
          name="Starter"
          price="$29"
          period="month"
          features={[
            '50 AI-generated posts per month',
            '3 connected platforms',
            'Basic analytics',
            'Content library',
            'Email support',
          ]}
        />
        <PlanCard
          name="Professional"
          price="$79"
          period="month"
          popular
          current
          features={[
            '200 AI-generated posts per month',
            'All platforms',
            'Advanced analytics',
            'Content scheduler',
            'Brand voice training',
            'Priority support',
            'Team collaboration (3 members)',
          ]}
        />
        <PlanCard
          name="Enterprise"
          price="$199"
          period="month"
          features={[
            'Unlimited AI-generated posts',
            'All platforms',
            'Custom analytics & reports',
            'Advanced scheduler',
            'Custom brand training',
            'Dedicated account manager',
            'Unlimited team members',
            'API access',
          ]}
        />
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
