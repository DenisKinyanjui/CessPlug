import React from 'react';
import { Truck, DollarSign, Shield, Headphones } from 'lucide-react';

const InfoStrip: React.FC = () => {
  const features = [
    {
      icon: <Truck className="w-8 h-8 text-orange-500 mx-auto md:mx-0" />,
      title: 'FASTER DELIVERY',
      description: 'Delivery in 24H',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-orange-500 mx-auto md:mx-0" />,
      title: 'AFFORDABLE PRICES',
      description: 'Best deals on electronics',
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-500 mx-auto md:mx-0" />,
      title: 'SECURE PAYMENT',
      description: 'Your money is safe',
    },
    {
      icon: <Headphones className="w-8 h-8 text-orange-500 mx-auto md:mx-0" />,
      title: 'SUPPORT 24/7',
      description: 'Live contact/message',
    },
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:space-x-4"
            >
              <div className="flex-shrink-0 mb-2 md:mb-0">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoStrip;
