import { FileText, AlertCircle, CheckCircle, Gavel } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        {/* Agreement */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Agreement to Terms</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using Ghostwrites ("the Service"), you agree to be bound by these Terms of Service 
            ("Terms"). If you do not agree to these Terms, please do not use our Service. These Terms apply to 
            all users of the Service, including without limitation users who are browsers, vendors, customers, 
            merchants, and/or contributors of content.
          </p>
        </section>

        {/* Description of Service */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Description of Service</h2>
          </div>
          <div className="space-y-3 text-gray-300">
            <p>
              Ghostwrites is an AI-powered content generation platform that helps users create marketing content 
              for various social media platforms. Our service includes:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>AI-assisted content generation for LinkedIn, Twitter, and Threads</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Brand settings and customization options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Content library and management features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Usage analytics and insights</span>
              </li>
            </ul>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">User Responsibilities</h2>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>As a user of Ghostwrites, you agree to:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Provide accurate and complete information when creating your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Maintain the security of your account credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Use the Service in compliance with all applicable laws and regulations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Not use the Service for any illegal or unauthorized purpose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Review and edit AI-generated content before publishing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Respect intellectual property rights and not plagiarize content</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Prohibited Uses */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Prohibited Uses</h2>
          <div className="space-y-3 text-gray-300">
            <p>You may not use our Service to:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                <span>Generate content that is illegal, harmful, threatening, or abusive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                <span>Create misleading, false, or deceptive content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                <span>Violate the rights of others, including privacy and intellectual property</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                <span>Distribute malware, viruses, or other harmful code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                <span>Spam or send unsolicited commercial messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                <span>Attempt to gain unauthorized access to our systems or other users' accounts</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Intellectual Property</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Our Content</h3>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of Ghostwrites and its licensors. The Service is protected by copyright, trademark, and 
                other laws of both the United States and foreign countries.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Your Content</h3>
              <p>
                You retain ownership of any content you create using our Service. However, by using our Service, 
                you grant us a limited, non-exclusive, royalty-free license to use, process, and analyze your 
                content solely to provide and improve our services.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">AI-Generated Content</h3>
              <p>
                Content generated by our AI is provided for your use. You are responsible for reviewing, editing, 
                and ensuring compliance with applicable laws before publishing. We do not claim ownership of 
                AI-generated content, but you acknowledge that such content may be similar to content generated 
                for other users.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Payment Terms</h2>
          <div className="space-y-3 text-gray-300">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Free trial includes limited usage as specified in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>Paid subscriptions are billed monthly or annually as selected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>All fees are non-refundable except as required by law</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40 mt-2 flex-shrink-0"></span>
                <span>We reserve the right to change pricing with 30 days notice</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Limitation of Liability</h2>
          </div>
          <div className="space-y-3 text-gray-300">
            <p>
              In no event shall Ghostwrites, its directors, employees, partners, agents, suppliers, or affiliates 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including 
              without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from 
              your use of the service.
            </p>
            <p>
              Our total liability to you for any cause of action whatsoever, and regardless of the form of the 
              action, will at all times be limited to the amount paid, if any, by you to us for the service during 
              the preceding month.
            </p>
          </div>
        </section>

        {/* Termination */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Termination</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              We may terminate or suspend your account and bar access to the service immediately, without prior 
              notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
            </p>
            <p>
              Upon termination, your right to use the service will cease immediately. All provisions of the 
              Terms which by their nature should survive termination shall survive, including ownership provisions, 
              warranty disclaimers, and limitations of liability.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Changes to Terms</h2>
          <p className="text-gray-300">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
            revision is material, we will try to provide at least 30 days notice prior to any new terms taking 
            effect. Your continued use of the service after such modifications constitutes acceptance of the 
            updated terms.
          </p>
        </section>

        {/* Contact Information */}
        <section className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p>Email: legal@ghostwrites.ai</p>
              <p>Address: 123 AI Street, Tech City, TC 12345</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
