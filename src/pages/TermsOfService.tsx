import { Helmet } from 'react-helmet-async';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-800">
      <Helmet>
        <title>Terms of Service | CessPlug</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>
          By accessing or using our website, services, or purchasing our products, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of the terms, you may not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
        <p>
          You must be at least 18 years old or the age of majority in your jurisdiction to use this site. By using this site, you represent and warrant that you meet the eligibility requirements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Account Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account information, including your email and password, and for all activities that occur under your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Product Information</h2>
        <p>
          We strive to ensure that all product details, images, and pricing are accurate. However, errors may occur, and we reserve the right to correct any inaccuracies and cancel any orders affected.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. Orders and Payments</h2>
        <p>
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice. Payments must be made in full before shipment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Shipping & Delivery</h2>
        <p>
          Shipping times and fees are detailed during checkout. Delays may occur due to external factors beyond our control. We are not responsible for delays or lost packages after dispatch.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Returns & Refunds</h2>
        <p>
          Please refer to our <a href="/return-policy" className="text-blue-500 underline">Return Policy</a> for details on eligibility and process. We reserve the right to deny a return if the product does not meet our criteria.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. User Conduct</h2>
        <p>
          You agree not to use the site for unlawful purposes, to harm others, or to interfere with the site’s security or functionality. We may terminate your access if you violate these rules.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Intellectual Property</h2>
        <p>
          All content on this site, including images, text, and logos, is the property of YourSiteName or its licensors and is protected by intellectual property laws. You may not use it without our written permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">10. Limitation of Liability</h2>
        <p>
          We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use of our site or products. Your use of the site is at your own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">11. Changes to Terms</h2>
        <p>
          We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated date. Continued use after changes means you accept the new terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">12. Contact Information</h2>
        <p>
          If you have any questions or concerns about these Terms, please contact us at <a href="mailto:support@yoursite.com" className="text-blue-500 underline">support@cessplug.com</a>.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
