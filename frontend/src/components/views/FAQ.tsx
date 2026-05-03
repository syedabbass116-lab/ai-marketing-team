import { HelpCircle, MessageCircle, CreditCard, Settings, Shield, Zap } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
  const [openCategory, setOpenCategory] = useState("general");
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const categories = [
    { id: "general", name: "General", icon: HelpCircle },
    { id: "pricing", name: "Pricing & Billing", icon: CreditCard },
    { id: "features", name: "Features", icon: Zap },
    { id: "technical", name: "Technical", icon: Settings },
    { id: "privacy", name: "Privacy & Security", icon: Shield }
  ];

  const faqData = {
    general: [
      {
        question: "What is Ghostwrites?",
        answer: "Ghostwrites is an AI-powered content generation platform that helps you create marketing content for social media platforms like LinkedIn, Twitter, and Threads. Our AI analyzes your brand voice and generates personalized content that matches your style."
      },
      {
        question: "How does the AI generate content?",
        answer: "Our AI uses advanced language models trained on marketing content and social media best practices. It considers your brand settings, target audience, and the specific platform requirements to generate relevant, engaging content."
      },
      {
        question: "Can I edit the AI-generated content?",
        answer: "Yes! All AI-generated content is fully editable. We encourage you to review and modify the content to ensure it perfectly matches your voice and requirements before publishing."
      },
      {
        question: "Is Ghostwrites suitable for beginners?",
        answer: "Absolutely! Ghostwrites is designed to be user-friendly for everyone, from beginners to experienced marketers. Our intuitive interface and AI assistance make content creation accessible to all skill levels."
      }
    ],
    pricing: [
      {
        question: "Is there a free trial?",
        answer: "Yes, we offer a 14-day free trial with full access to all features. You can generate up to 50 pieces of content during the trial period to see if Ghostwrites is right for you."
      },
      {
        question: "What happens after the trial ends?",
        answer: "After your trial ends, you'll need to choose a paid plan to continue using Ghostwrites. Your data and saved content will be preserved, and you can upgrade or downgrade your plan at any time."
      },
      {
        question: "Can I change my plan later?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged the prorated difference. If you downgrade, the new rate will apply at your next billing cycle."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners."
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 30-day money-back guarantee for new paid subscriptions. If you're not satisfied with Ghostwrites, contact our support team within 30 days of your first payment for a full refund."
      }
    ],
    features: [
      {
        question: "Which social media platforms do you support?",
        answer: "Currently, we support LinkedIn, Twitter (X), and Threads. Each platform has optimized content generation that follows best practices and character limits for that specific platform."
      },
      {
        question: "What are brand settings?",
        answer: "Brand settings allow you to define your brand voice, target audience, key topics, and writing style. The AI uses these settings to generate content that aligns with your brand identity."
      },
      {
        question: "Can I save my generated content?",
        answer: "Yes! All generated content is automatically saved to your content library. You can organize, edit, and reuse your saved content anytime. Your library also tracks performance metrics."
      },
      {
        question: "Is there a limit on content generation?",
        answer: "Each plan has different usage limits. The free trial includes 50 generations, while paid plans offer higher limits based on your subscription tier. You can check your current usage in your account settings."
      }
    ],
    technical: [
      {
        question: "What browsers are supported?",
        answer: "Ghostwrites works best on modern browsers including Chrome (version 90+), Firefox (version 88+), Safari (version 14+), and Edge (version 90+). We recommend keeping your browser updated for the best experience."
      },
      {
        question: "Is there a mobile app?",
        answer: "Currently, Ghostwrites is available as a web application that works on mobile browsers. We're working on native mobile apps for iOS and Android, which will be released soon."
      },
      {
        question: "How do I report bugs or issues?",
        answer: "If you encounter any issues, please contact our support team at support@ghostwrites.ai or use the contact form in the app. We typically respond within 24 hours."
      },
      {
        question: "Can I integrate Ghostwrites with other tools?",
        answer: "We're currently working on integrations with popular marketing tools and social media management platforms. You can join our waitlist to be notified when new integrations are available."
      }
    ],
    privacy: [
      {
        question: "Is my data secure?",
        answer: "Yes, we take data security seriously. All data is encrypted in transit and at rest. We use industry-standard security measures and comply with data protection regulations including GDPR and CCPA."
      },
      {
        question: "Do you sell my data?",
        answer: "No, we never sell your personal data or content to third parties. Your data is only used to provide and improve our services. Read our Privacy Policy for more details."
      },
      {
        question: "Who owns the AI-generated content?",
        answer: "You own all content generated using Ghostwrites. We don't claim any ownership rights over the content you create. You're free to use it however you like."
      },
      {
        question: "Can I delete my account and data?",
        answer: "Yes, you can delete your account at any time from your account settings. This will permanently remove all your data from our systems within 30 days."
      }
    ]
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-400">
          Find answers to common questions about Ghostwrites
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setOpenCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                openCategory === category.id
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* FAQ Questions */}
      <div className="space-y-4">
        {faqData[openCategory as keyof typeof faqData]?.map((faq, index) => {
          const globalIndex = `${openCategory}-${index}`;
          const isExpanded = expandedQuestions.includes(Number(globalIndex));
          
          return (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleQuestion(Number(globalIndex))}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-white/60 flex-shrink-0" />
                  <h3 className="text-white font-medium">{faq.question}</h3>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}>
                  <div className="w-2 h-2 border-b-2 border-r-2 border-white/60 transform -rotate-45 translate-y-0.5"></div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-4">
                  <p className="text-gray-300 pl-8">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions */}
      <div className="mt-12 text-center bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-8">
        <MessageCircle className="w-12 h-12 text-white mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-3">Still have questions?</h2>
        <p className="text-gray-300 mb-6">
          Can't find the answer you're looking for? Our support team is here to help.
        </p>
        <button 
          onClick={() => window.location.href = '/contact'}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}
