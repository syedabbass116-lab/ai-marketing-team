import { Shield, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Our Commitment to Privacy</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            At Ghostwrites, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, and protect your information when you use our AI-powered content 
            generation platform.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Personal Information</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Name and email address for account creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Profile information and avatar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Payment information for billing (processed securely by third-party providers)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2">Content and Usage Data</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Brand settings and preferences you configure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Content you generate and save in your library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Usage patterns and analytics to improve our service</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2">Technical Information</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>IP address and device information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Browser type and version</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                  <span>Cookies and similar tracking technologies</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
          </div>
          
          <div className="space-y-3 text-gray-300">
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
              <span>To provide and maintain our AI content generation service</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
              <span>To personalize your experience and improve content quality</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
              <span>To communicate with you about your account and our services</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
              <span>To analyze usage patterns and improve our platform</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
              <span>To ensure security and prevent fraudulent activities</span>
            </p>
          </div>
        </section>

        {/* Data Protection */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Data Protection and Security</h2>
          </div>
          
          <div className="space-y-4 text-gray-300">
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>SSL encryption for all data transmissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Secure storage of personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Regular security audits and updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Limited access to personal data for authorized personnel only</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
          
          <div className="space-y-3 text-gray-300">
            <p>You have the right to:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Access your personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Correct inaccurate information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Delete your account and associated data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Opt-out of marketing communications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Request data portability</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
          
          <div className="space-y-3 text-gray-300">
            <p>
              If you have questions about this Privacy Policy or how we handle your information, 
              please contact us at:
            </p>
            <div className="space-y-2">
              <p>Email: abbhasan098@gmail.com</p>
              <p>Address: Lucknow, India</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
