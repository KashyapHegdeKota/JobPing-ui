import { Copy, Gift, UserPlus } from "lucide-react";

export default function ReferralsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-mono p-8 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-gray-500 mt-2">Invite your friends and get rewarded when they upgrade.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-50 text-red-500 rounded-lg">
              <Gift size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Your Referral Link</h2>
              <p className="text-gray-500 text-sm mt-1">Share this link to give your friends 1 free month.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value="https://jobping.com?ref=jp_usr_9a8b7c6d" 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium transition-colors">
              <Copy size={18} />
              Copy Link
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Apply a Code</h2>
              <p className="text-gray-500 text-sm mt-1">Did someone refer you? Enter their code here.</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. jp_usr_..." 
              className="flex-1 bg-transparent border border-gray-200 rounded-md px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
