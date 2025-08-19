import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DrawDay Extension - Options',
  description: 'Extension configuration and competition management',
};

export default function OptionsPage() {
  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white text-xl font-bold">
              ⚙️
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Extension Options</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Configure your DrawDay extension settings, manage competitions, and customize spinner
              behavior.
            </p>
          </div>

          {/* Content Areas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Competition Management</h3>
              <p className="text-sm text-gray-600">
                Import CSV files, manage participants, and configure competition settings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Spinner Settings</h3>
              <p className="text-sm text-gray-600">
                Customize spin duration, deceleration rate, and animation preferences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Appearance</h3>
              <p className="text-sm text-gray-600">
                Theme selection, color customization, and branding options.
              </p>
            </div>
          </div>

          {/* Route Info */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500 text-center">iframe route: /extension/options</p>
          </div>
        </div>
      </div>
    </div>
  );
}
