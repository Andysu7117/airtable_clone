import { CheckCircle, X, Sparkles, Grid3X3, Upload, FileText, Plus } from "lucide-react";
import BaseGrid from "../_components/BaseGrid";
import Header from "../_components/Header";

export default async function HomePage() {
  const bases = [
    { id: "1", name: "Untitled Base", color: "green", lastOpened: "just now" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Welcome Banner */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">
              Welcome to the improved Home. Find, navigate to, and manage your apps more easily.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-green-700 hover:text-green-800 underline">
              See what's new
            </button>
            <button className="text-green-600 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="px-6 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Home</h1>

        {/* Creation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start with Omni</h3>
            <p className="text-sm text-gray-600">
              Use AI to build a custom app tailored to your workflow.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200">
              <Grid3X3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start with templates</h3>
            <p className="text-sm text-gray-600">
              Select a template to get started and customize as you go.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer group">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200">
              <Upload className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quickly upload</h3>
            <p className="text-sm text-gray-600">
              Easily migrate your existing projects in just a few minutes.
            </p>
          </div>

          <div className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer group">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Build an app on your own</h3>
            <p className="text-sm text-gray-600">
              Start with a blank app and build your ideal workflow.
            </p>
          </div>
        </div>

        {/* Recently Opened Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Opened anytime</h2>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <BaseGrid bases={bases} />
        </div>
      </main>
    </div>
  );
}