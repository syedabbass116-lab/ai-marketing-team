import { Users, Target, Lightbulb, Award, Rocket, Heart, User, Brain, MessageCircle, Zap } from "lucide-react";
import founderImage from "../../assets/founder.jpeg";
import logo from "../../assets/logo.png";

export default function AboutUs() {
  const values = [
    {
      icon: Target,
      title: "Speed without sacrificing quality",
      description: "We build tools that help you move fast while maintaining excellence."
    },
    {
      icon: Lightbulb,
      title: "Simplicity over complexity",
      description: "Clean, intuitive interfaces that just work."
    },
    {
      icon: Zap,
      title: "Real-world usefulness over hype",
      description: "Practical tools that solve actual problems."
    }
  ];

  const products = [
    {
      icon: MessageCircle,
      title: "AI Content Assistant",
      description: "Social media, on autopilot"
    },
    {
      icon: Brain,
      title: "AI Advisor", 
      description: "Structured thinking for better decisions"
    },
    {
      icon: User,
      title: "AI Voice Companion",
      description: "Natural, real conversations with AI"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-6">About Us</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          We build AI tools that actually get used.
        </p>
      </div>

      {/* What We're Building */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">What We're Building</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">At our core, we believe:</h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              AI shouldn't feel like a tool. It should feel like a thinking partner.
            </p>
            <p className="text-gray-300 leading-relaxed">
              That idea drives everything we build—from content systems to decision-making tools.
            </p>
          </div>
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="Ghostwrites Logo" 
              className="w-32 h-32 rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* The Product */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">The Product</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Our ghostwriting app is built for founders, creators, and professionals who want to show up online—without spending hours writing.</h3>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            It helps you:
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-300">turn ideas into high-quality posts</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-300">write in your own voice</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-300">stay consistent on LinkedIn, X, and Threads</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-white/10 rounded-xl p-6">
            <p className="text-xl font-semibold text-white mb-4">Not generic outputs.</p>
            <p className="text-gray-300">
              Content that sounds like you—clear, sharp, and worth reading.
            </p>
          </div>
        </div>
      </section>

      {/* Beyond Content */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">Beyond Content</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            We're building more than one tool—we're building a system for how people think and create:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product, index) => {
              const Icon = product.icon;
              return (
                <div key={index} className="bg-black/30 border border-white/10 rounded-xl p-6">
                  <Icon className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{product.title}</h3>
                  <p className="text-gray-400">{product.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">Founder</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Founded in April 2026 by Mohd Abbas.</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Built by someone who:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">has spent years experimenting with AI systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">understands both product and distribution</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">has worked on B2B outreach, pre-sales, and collaborated with founders in the UK and US</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mt-6">
                This isn't just about building tools—it's about building things people actually use.
              </p>
            </div>
            <div className="flex justify-center">
              <img 
                src={founderImage} 
                alt="Mohd Abbas - Founder" 
                className="w-64 h-64 rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">What We Care About</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Icon className="w-8 h-8 text-white mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What's Next */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">What's Next</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                We're actively building, improving, and working with people who want to use AI to do meaningful work.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Open to collaborations, projects, and conversations with founders in AI space.
              </p>
            </div>
            <div>
              <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Final Line</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you're building something—or thinking about it—
                </p>
                <p className="text-gray-300 text-lg font-semibold">
                  we'd love to be part of that journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
