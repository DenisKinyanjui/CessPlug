import React from "react";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoHome = () => {
    navigate("/"); // Navigate to home page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-[500px] w-full bg-white rounded-xl shadow-sm p-8 text-center">
        {/* Error icon */}
        <div className="mb-6">
          <img 
            src="/images/HeroError.svg" 
            alt="Error" 
            className="mx-auto w-40 h-40"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          404, Page not found
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Something went wrong. It's look that your requested page could not be found. 
          It's look like the link is broken or the page has been removed.
        </p>

        {/* Error label */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            ERROR
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>GO BACK</span>
          </button>

          <button
            onClick={handleGoHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Home size={16} />
            <span>GO TO HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;