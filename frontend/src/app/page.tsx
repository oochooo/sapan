import Link from "next/link";
import { Search, Users, Network } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Thailand&apos;s Startup Ecosystem Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect founders with mentors who&apos;ve been there before
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup?type=founder"
                className="px-8 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started as Founder
              </Link>
              <Link
                href="/signup?type=mentor"
                className="px-8 py-3 text-lg font-medium text-primary-600 bg-white border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Apply as Mentor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Find Mentors
            </h3>
            <p className="text-gray-600">
              Browse experts by industry & expertise
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Get Guidance
            </h3>
            <p className="text-gray-600">
              Pitch review, fundraising, go-to-market
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Network className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Build Network
            </h3>
            <p className="text-gray-600">
              Connect with Thailand&apos;s top startup minds
            </p>
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Industries We Support
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "SaaS",
              "FinTech",
              "HealthTech",
              "EdTech",
              "DeepTech/AI",
              "Marketplace",
              "Consumer/D2C",
              "Hardware/IoT",
              "FoodTech",
              "Services",
            ].map((industry) => (
              <span
                key={industry}
                className="px-4 py-2 bg-white rounded-full text-gray-700 border border-gray-200 text-sm font-medium"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 Sapan.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
