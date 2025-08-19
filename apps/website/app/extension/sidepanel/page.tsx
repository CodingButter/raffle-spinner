import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DrawDay Spinner - Sidepanel',
  description: 'Live raffle drawing interface',
};

export default function SidepanelPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold">
          🎯
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Spinner Sidepanel</h1>
        <p className="text-gray-600 max-w-md">
          This is the main interface for live raffle draws. The spinner wheel and winner reveal will
          be displayed here.
        </p>
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">iframe route: /extension/sidepanel</p>
        </div>
      </div>
    </div>
  );
}
