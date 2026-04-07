import { Check, CreditCard, Download } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

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
    <Card className={popular ? 'border-white' : ''}>
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
            POPULAR
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-gray-400">/{period}</span>
        </div>
        <Button
          variant={current ? 'secondary' : 'primary'}
          className="w-full"
          disabled={current}
        >
          {current ? 'Current Plan' : 'Upgrade'}
        </Button>
      </div>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Plans</h1>
        <p className="text-gray-400">Choose the plan that fits your content needs</p>
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

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Visa ending in 4242</p>
              <p className="text-xs text-gray-400">Expires 12/2025</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
        <Button variant="secondary" size="sm">
          Add Payment Method
        </Button>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
        <div className="space-y-3">
          {[
            { date: 'Mar 1, 2024', amount: '$79.00', status: 'Paid' },
            { date: 'Feb 1, 2024', amount: '$79.00', status: 'Paid' },
            { date: 'Jan 1, 2024', amount: '$79.00', status: 'Paid' },
          ].map((invoice, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{invoice.date}</p>
                <p className="text-xs text-gray-400">Professional Plan</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white font-medium">{invoice.amount}</span>
                <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded">
                  {invoice.status}
                </span>
                <Button variant="ghost" size="sm" icon={<Download className="w-3 h-3" />}>
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
