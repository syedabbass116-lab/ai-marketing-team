import { Target, Lightbulb, Award, Rocket } from "lucide-react";
import logo from "../../assets/logo.png";
import founder from "../../assets/founder.jpeg";

export default function AboutUs() {
  const values = [
    {
      icon: Rocket,
      title: "Speed without sacrificing quality",
      description: "We build tools that help you create faster while maintaining the highest standards."
    },
    {
      icon: Lightbulb,
      title: "Simplicity over complexity",
      description: "Our approach focuses on making powerful tools that are intuitive and easy to use."
    },
    {
      icon: Target,
      title: "Real-world usefulness over hype",
      description: "Every feature we build solves actual problems people face in their daily work."
    }
  ];

  const products = [
    {
      title: "AI Content Assistant",
      description: "Social media, on autopilot"
    },
    {
      title: "AI Advisor", 
      description: "Structured thinking for better decisions"
    },
    {
      title: "AI Voice Companion",
      description: "Natural, real conversations with AI"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">About Us</h1>
        <div className="flex items-center gap-4 mb-6">
          <img
            src={logo}
            alt="Ghostwrites logo"
            className="h-20 w-20 object-contain"
          />
          <p className="text-xl text-gray-400">
            We build AI tools that actually get used.
          </p>
        </div>
        <p className="text-gray-300 leading-relaxed">
          Not kind that look impressive in demos and fall apart in real workflows—
          but tools that help people think, create, and move faster.
        </p>
      </div>

      {/* What We're Building */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={logo}
              alt="Ghostwrites logo"
              className="h-16 w-16 object-contain"
            />
            <h2 className="text-2xl font-semibold text-white">What We're Building</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            At our core, we believe:
          </p>
          <div className="bg-black/30 border border-white/10 rounded-lg p-6 mb-6">
            <p className="text-lg text-white italic mb-4">
              "AI shouldn't feel like a tool. It should feel like a thinking partner."
            </p>
            <p className="text-gray-300">
              That idea drives everything we build—from content systems to decision-making tools.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">The Product</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            Our ghostwriting app is built for founders, creators, and professionals who want to show up online—without spending hours writing.
            It helps you:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">turn ideas into high-quality posts</h4>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">write in your own voice</h4>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">stay consistent on LinkedIn, X, and Threads</h4>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Not generic outputs.</h4>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-white font-medium">
              Content that sounds like you—clear, sharp, and worth reading.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Beyond Content</h3>
          <p className="text-gray-300 leading-relaxed mb-6">
            We're building more than one tool—we're building a system for how people think and create:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div key={index} className="bg-black/30 border border-white/10 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-2">{product.title}</h4>
                <p className="text-gray-400 text-sm">{product.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Each product is designed to solve real problems—not just showcase AI.</h3>
        </div>
      </section>

      {/* Founder Section */}
      <section className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Founder</h2>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Founded in April 2026 by Mohd Abbas.</h3>
            <div className="flex items-start gap-6 mb-4">
              <div className="flex-1">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Built by someone who:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>has spent years experimenting with AI systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>understands both product and distribution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>has worked on B2B outreach, pre-sales, and collaborated with founders in the UK and US</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>has a proven track record of building successful products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>has a proven track record of building successful products</span>
                  </li>
                </ul>
              </div>
              <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                <img
                  src={founder}
                  alt="Mohd Abbas - Founder"
                  className="w-24 h-24 rounded-full object-cover border-2 border-white/30"
                />
              </div>
            </div>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <p className="text-gray-300 italic">
              This isn't just about building tools—it's about building things people actually use.
            </p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">What We Care About</h3>
          </div>
          <div className="space-y-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">{value.title}</h4>
                    <p className="text-gray-400 text-sm">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's Next */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">What's Next</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          We're actively building, improving, and working with people who want to use AI to do meaningful work.
          Open to collaborations, projects, and conversations with founders in the AI space.
        </p>
      </section>

      {/* Final Line */}
      <section className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Final Line</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          If you're building something—or thinking about it—
          we'd love to be part of that journey.
        </p>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-white/5 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Start Building with AI</h2>
        <p className="text-gray-300 mb-6">
          Join thousands of creators and professionals using tools that actually work.
        </p>
        <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors">
          Get Started Free
        </button>
      </section>
    </div>
  );
}
