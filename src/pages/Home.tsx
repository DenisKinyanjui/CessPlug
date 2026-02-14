import React from 'react';
import SEOHelmet from '../components/SEO/SEOHelmet';
import HeroBanner from '../components/Hero/HeroBanner';
import InfoStrip from '../components/Features/InfoStrip';
import TodaysDeals from '../components/Sections/TodaysDeals';
import TopCategories from '../components/Sections/TopCategories';
import TopBrands from '../components/Sections/TopBrands';
import FrequentlyBought from '../components/Sections/FrequentlyBought';
import FeaturedProducts from '../components/Sections/FeaturedProducts'
import NewArrivals from '../components/Sections/NewArrivals';

const Home: React.FC = () => {
  return (
    <>
      <SEOHelmet
        title="CessPlug - Best Online Store | Smartphones, Laptops & More"
        description="Shop from the best online store. Find smartphones, laptops, home appliances, and more at unbeatable prices with fast delivery. Up to 80% off on top brands!"
        keywords="electronics store, smartphones, laptops, home appliances, online shopping, best deals, fast delivery, CessPlug"
      />
      
      <main>
        <HeroBanner />
        {/* <InfoStrip /> */}
        <TodaysDeals />
        <NewArrivals />
        {/* <TopCategories /> */}
        <TopBrands />
        <FrequentlyBought />
        <FeaturedProducts />
        
      </main>
    </>
  );
};

export default Home;