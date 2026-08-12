import { Plus, Tag } from "lucide-react";

export default function TrackersPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-mono p-8 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trackers</h1>
            <p className="text-gray-500 mt-2">Manage your job application trackers.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Usage</span>
                <span>36/50</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
              <Plus size={18} />
              New Tracker
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-4">My First Tracker</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                <Tag size={14} /> Internship
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                <Tag size={14} /> Full-Time
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                <Tag size={14} /> Software Engineer
              </span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
              <span>Updated 2h ago</span>
              <button className="text-red-500 hover:text-red-600 font-medium">View &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
