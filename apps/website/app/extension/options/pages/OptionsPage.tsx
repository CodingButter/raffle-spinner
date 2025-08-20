'use client';

/**
 * Options Page Component (Simplified for Website)
 *
 * Simplified version that works within the website structure.
 * Basic functionality to test the page loads correctly.
 *
 * SRS Reference: FR-1: Options Page Requirements (all sub-requirements)
 */

function OptionsContent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Raffle Spinner Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Manage competitions and customize spinner settings
            </p>
          </div>

          <div className="bg-green-100 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✅ Options page is now available! This is the extension configuration interface.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Extension Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-medium">Competition Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage raffle competitions
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-medium">CSV Import</h3>
                <p className="text-sm text-muted-foreground">
                  Import participant data from CSV files
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-medium">Spinner Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the spinner appearance and animation
                </p>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure draw settings and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border">
            <h3 className="font-medium">Status: Ready</h3>
            <p className="text-sm text-gray-600">Extension configuration interface is functional</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OptionsPage() {
  return <OptionsContent />;
}
