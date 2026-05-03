import { Users, Target, Lightbulb, Award, Rocket, Heart } from "lucide-react";

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "CEO & Co-Founder",
      description: "Former AI researcher at Google, passionate about democratizing content creation."
    },
    {
      name: "Sarah Johnson",
      role: "CTO & Co-Founder", 
      description: "Machine learning expert with 10+ years building scalable AI systems."
    },
    {
      name: "Mike Williams",
      role: "Head of Product",
      description: "Product leader focused on user experience and innovative AI solutions."
    },
    {
      name: "Emily Davis",
      role: "Head of Design",
      description: "Creative director bringing beautiful interfaces to complex AI tools."
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're on a mission to make quality content creation accessible to everyone."
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "Pushing the boundaries of AI to solve real-world content challenges."
    },
    {
      icon: Users,
      title: "User-Centric",
      description: "Every decision we make starts with how it impacts our users."
    },
    {
      icon: Heart,
      title: "Community Focused",
      description: "Building a supportive community of creators and marketers."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">About Ghostwrites</h1>
        <p className="text-xl text-gray-400">
          Empowering creators and marketers with AI-powered content generation
        </p>
      </div>

      {/* Hero Section */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Our Story</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ghostwrites was born from a simple observation: creating compelling marketing content is 
              time-consuming and challenging for many businesses and creators. We saw an opportunity to 
              leverage cutting-edge AI technology to make this process faster, easier, and more effective.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Founded in 2024, we've helped thousands of users generate millions of words of content, 
              from LinkedIn posts to Twitter threads, enabling them to focus on what matters most - growing 
              their business and connecting with their audience.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <Rocket className="w-24 h-24 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">Our Mission</h3>
          <p className="text-gray-300 leading-relaxed">
            To democratize content creation by providing accessible, intelligent, and user-friendly AI tools 
            that help individuals and businesses communicate their ideas effectively across all platforms.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">Our Vision</h3>
          <p className="text-gray-300 leading-relaxed">
            A world where anyone can create compelling, professional content regardless of their writing 
            experience or technical expertise, where AI amplifies human creativity rather than replaces it.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <Icon className="w-8 h-8 text-white mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-8 mb-12">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">50K+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">10M+</div>
            <div className="text-gray-400">Words Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">4.9★</div>
            <div className="text-gray-400">User Rating</div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Meet Our Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full mb-4 border border-white/20"></div>
              <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-sm text-white/60 mb-3">{member.role}</p>
              <p className="text-gray-400 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-white" />
          <h2 className="text-2xl font-semibold text-white">Our Technology</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Advanced AI Models</h3>
            <p className="text-gray-400 text-sm">
              We leverage state-of-the-art language models fine-tuned specifically for marketing and social media content.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Brand Intelligence</h3>
            <p className="text-gray-400 text-sm">
              Our AI learns your brand voice and style to maintain consistency across all generated content.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Platform Optimization</h3>
            <p className="text-gray-400 text-sm">
              Content is optimized for each platform's unique requirements, from LinkedIn's professional tone to Twitter's character limits.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-white/10 to-white/5 border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Join Our Journey</h2>
        <p className="text-gray-300 mb-6">
          We're just getting started. Join thousands of creators and marketers who are already using Ghostwrites 
          to transform their content strategy.
        </p>
        <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors">
          Get Started Free
        </button>
      </section>
    </div>
  );
}
