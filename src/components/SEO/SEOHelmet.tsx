import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title = 'CessPlug - The Best Online Store',
  description = 'Shop from the best electronics store online. Find smartphones, laptops, home appliances, and more at unbeatable prices with fast delivery.',
  keywords = 'electronics, smartphones, laptops, home appliances, online shopping, best deals',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
CessPlug      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CessPlug",
          "description": description,
          "url": "https://cessplug.com",
          "logo": "https://cessplug.com/images/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-123-4567",
            "contactType": "customer service"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHelmet;