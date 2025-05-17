'use client';

import React from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-500 mx-auto mb-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for your purchase. Your access to more job listings should now be unlocked.
        </p>
        <div className="space-y-4">
          <Link href="/" legacyBehavior>
            <a className="w-full block px-6 py-3 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 ease-in-out text-lg">
              Back to Job Listings
            </a>
          </Link>
          {/* You could add a link to a user dashboard or orders page if applicable */}
          {/* <Link href="/dashboard/payments" legacyBehavior>
            <a className="w-full block px-6 py-3 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-150 ease-in-out text-lg">
              View Payment History
            </a>
          </Link> */}
        </div>
      </div>
      <p className="mt-8 text-xs text-gray-500">If you have any questions, please contact support.</p>
    </div>
  );
}
