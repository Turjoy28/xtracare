import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 font-sans">
      <div className="text-center relative flex flex-col items-center">
        <h1 className="text-9xl md:text-[150px] font-extrabold text-gray-200 tracking-widest select-none">
          404
        </h1>
        <div className="bg-[#72BF78] text-white px-3 py-1 text-sm rounded absolute top-[40%] md:top-[50%] shadow-sm transform -rotate-12">
          Page Not Found
        </div>
        <div className="mt-8 relative z-10">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Oops! You're lost.
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-base md:text-lg">
            The page you are looking for does not exist or might have been removed. 
            Let's get you back on track.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-8 py-3 bg-[#A04747] text-white font-medium rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
