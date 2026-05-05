import { Check, CreditCard, Download, Zap } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useState } from 'react';

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
  onUpgrade?: (planName: string, amount: number) => void;
  processingPayment?: boolean;
}

function PlanCard({ name, price, period, postsPerMonth, platforms, features, current, popular, onUpgrade, processingPayment }: PlanCardProps) {
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
          disabled={current || processingPayment}
          onClick={() => !current && onUpgrade && onUpgrade(name, parseInt(price.replace('$', '')))}
        >
          {processingPayment ? 'Processing...' : current ? 'Current Plan' : 'Upgrade'}
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
  twitter: 'X (Twitter)',
  threads: 'Threads',
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-900/30 text-blue-300',
  twitter: 'bg-sky-900/30 text-sky-300',
  threads: 'bg-zinc-900/30 text-zinc-300',
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
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleRazorpayPayment = async (planName: string, amount: number) => {
    setProcessingPayment(true);
    
    try {
      console.log('Starting payment process for:', planName, amount);
      
      // Step 1: Create order from backend
      const orderResponse = await fetch('http://localhost:8000/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          receipt: `${planName.toLowerCase()}_${Date.now()}`
        })
      });

      console.log('Order response status:', orderResponse?.status);
      
      if (!orderResponse || !orderResponse.ok) {
        const errorText = orderResponse ? await orderResponse.text() : 'No response';
        console.error('Order creation failed:', errorText);
        alert(`Failed to create order: ${errorText}`);
        setProcessingPayment(false);
        return;
      }

      const orderData = await orderResponse.json();
      console.log('Order data received:', orderData);
      
      // Step 2: Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Step 3: Open Razorpay modal with order_id
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SlkKwYIOooZtJP',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Ghostwrites',
          description: `${planName} Plan Subscription`,
          order_id: orderData.order_id,
          image: 'https://your-logo-url.com/logo.png', // Add your logo URL
          handler: async function (response: any) {
            // Step 4: Verify payment with backend
            try {
              const verifyResponse = await fetch('http://localhost:8000/api/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              if (!verifyResponse || !verifyResponse.ok) {
                const errorText = verifyResponse ? await verifyResponse.text() : 'No response';
                console.error('Verification failed:', errorText);
                alert(`Payment verification failed: ${errorText}`);
                return;
              }

              const verifyData = await verifyResponse.json();
              console.log('Payment verified:', verifyData);
              alert('Payment successful! Plan upgraded.');
              // You can redirect or update UI here
              window.location.reload(); // Refresh to show updated plan
            } catch (error) {
              console.error('Verification error:', error);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
            contact: '+919999999999'
          },
          theme: {
            color: '#3399cc'
          },
          modal: {
            ondismiss: function() {
              console.log('Payment modal dismissed');
              setProcessingPayment(false);
            },
            escape: true,
            backdropclose: false
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          console.error('Payment failed:', response.error);
          alert(`Payment failed: ${response.error.description}`);
          setProcessingPayment(false);
        });
        rzp.open();
      };

      script.onerror = () => {
        console.error('Failed to load Razorpay');
        alert('Payment gateway unavailable. Please try again.');
        setProcessingPayment(false);
      };
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  // Calculate real usage from library
  const platformUsage: Record<string, number> = {
    linkedin: 0,
    twitter: 0,
    threads: 0,
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
            price="$1"
            period="month"
            postsPerMonth={50}
            platforms={3}
            features={[
              'LinkedIn, Twitter, Instagram',
              'Monthly post limit',
              'Content library storage',
              'Email support',
            ]}
            onUpgrade={handleRazorpayPayment}
            processingPayment={processingPayment}
          />
          <PlanCard
            name="Professional"
            price="$1"
            period="month"
            postsPerMonth={200}
            platforms={6}
            popular
            features={[
              'All 6 platforms',
              'Monthly post limit',
              'Content library storage',
              'Priority support',
              'Export posts',
            ]}
            onUpgrade={handleRazorpayPayment}
            processingPayment={processingPayment}
          />
          <PlanCard
            name="Enterprise"
            price="$1"
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
            onUpgrade={handleRazorpayPayment}
            processingPayment={processingPayment}
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
          <Button variant="ghost" size="sm" onClick={() => alert('Card update functionality coming soon!')}>Update</Button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-blue-400">₹</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Razorpay</p>
              <p className="text-xs text-white/30">Pay via UPI, Cards, NetBanking</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => alert('Razorpay is configured and ready! Use the Upgrade buttons above to test payments.')}>Configure</Button>
        </div>
        
        <Button variant="secondary" size="sm" onClick={() => alert('Payment methods are managed through Razorpay checkout. Use the Upgrade buttons above to add a payment method.')}>Add Payment Method</Button>
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
