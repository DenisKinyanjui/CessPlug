import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <Helmet>
        <title>Privacy Policy | CessPlug</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>

      <p className="mb-6">
        At <strong>CessPlug</strong>, we value your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p>
          We may collect personal information that you provide directly to us, such as your name, email address, phone number, shipping address, billing information, and payment details when placing an order or creating an account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <p>
          We use your information to:
        </p>
        <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
          <li>Process and fulfill orders</li>
          <li>Send order and shipping confirmations</li>
          <li>Provide customer support</li>
          <li>Personalize your shopping experience</li>
          <li>Improve our website and services</li>
          <li>Send promotional emails (you may opt out at any time)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Sharing Your Information</h2>
        <p>
          We do not sell or rent your personal information. However, we may share it with:
        </p>
        <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
          <li>Service providers that assist in operating our site (e.g., payment processors, shipping partners)</li>
          <li>Legal authorities if required by law or to protect our rights</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Cookies & Tracking</h2>
        <p>
          We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can disable cookies in your browser settings, but some features may not work correctly.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal data. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal data. You may also object to or restrict certain processing. To exercise your rights, contact us at <a href="mailto:support@yoursite.com" className="text-blue-500 underline">support@cessplug.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party sites. We are not responsible for their privacy practices, so we encourage you to review their policies separately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 13. We do not knowingly collect data from children. If we discover such data, we will delete it immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date. Please check back regularly to stay informed.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
        <p>
          If you have any questions or concerns about this policy, contact us at <a href="mailto:support@yoursite.com" className="text-blue-500 underline">support@cessplug.com</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
