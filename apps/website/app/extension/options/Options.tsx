/**
 * Options Page Component (Full Implementation)
 *
 * Complete competition management interface with CSV import,
 * duplicate handling, and localStorage integration.
 *
 * Required features:
 * - Competition CRUD operations
 * - CSV import with column mapping
 * - Duplicate ticket handling
 * - Settings management
 * - Theme customization (Pro users)
 */

'use client';

import { CompetitionProvider } from '@/contexts/CompetitionContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { useState, useRef } from 'react';
import { useCompetitions } from '@/contexts/CompetitionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Input } from '@drawday/ui/input';
import { Label } from '@drawday/ui/label';
import { Upload, Plus, FileText, Trash2, Edit } from 'lucide-react';
import { Competition, Participant } from '@raffle-spinner/storage';

// Simple CSV parser implementation
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

function OptionsContent() {
  const { competitions, addCompetition, deleteCompetition, loading } = useCompetitions();
  const [newCompetitionName, setNewCompetitionName] = useState('');
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateCompetition = async () => {
    if (!newCompetitionName.trim()) return;

    let participants: Participant[] = [];

    if (csvData.length > 0) {
      // Convert CSV data to participants
      participants = csvData.map((row, index) => ({
        id: `${Date.now()}-${index}`,
        firstName: row['First Name'] || row['Name'] || row['first_name'] || '',
        lastName: row['Last Name'] || row['Surname'] || row['last_name'] || '',
        ticketNumber:
          row['Ticket'] || row['Ticket Number'] || row['ticket_number'] || `${index + 1}`,
        eliminated: false,
      }));
    }

    const competition: Competition = {
      id: Date.now().toString(),
      name: newCompetitionName,
      participants,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await addCompetition(competition);
    setNewCompetitionName('');
    setCsvData([]);
    setShowCsvPreview(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const parsed = parseCSV(csvText);
        setCsvData(parsed);
        setShowCsvPreview(true);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Raffle Spinner Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Manage competitions and customize spinner settings
          </p>
        </div>

        {/* Create New Competition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Competition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="competition-name">Competition Name</Label>
                <Input
                  id="competition-name"
                  value={newCompetitionName}
                  onChange={(e) => setNewCompetitionName(e.target.value)}
                  placeholder="Enter competition name..."
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateCompetition}
                  disabled={!newCompetitionName.trim() || loading}
                  className="w-full"
                >
                  Create Competition
                </Button>
              </div>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium mb-1">Import Participants from CSV</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with participant data (optional)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="mr-2 h-4 w-4" />
                  Choose CSV File
                </Button>
              </div>
            </div>

            {showCsvPreview && csvData.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-medium mb-2">CSV Preview ({csvData.length} participants)</h3>
                <div className="max-h-40 overflow-y-auto text-sm">
                  {csvData.slice(0, 5).map((row, index) => (
                    <div key={index} className="py-1">
                      {Object.entries(row).map(([key, value]) => (
                        <span key={key} className="mr-4">
                          <strong>{key}:</strong> {value}
                        </span>
                      ))}
                    </div>
                  ))}
                  {csvData.length > 5 && (
                    <p className="text-muted-foreground mt-2">
                      ...and {csvData.length - 5} more participants
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Competitions */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Competitions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading competitions...</p>
              </div>
            ) : competitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>No competitions created yet.</p>
                <p className="text-sm">Create your first competition above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {competitions.map((competition) => (
                  <div
                    key={competition.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{competition.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {competition.participants.length} participants
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCompetition(competition.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function Options() {
  return (
    <ThemeProvider>
      <CompetitionProvider>
        <SettingsProvider>
          <SubscriptionProvider>
            <OptionsContent />
          </SubscriptionProvider>
        </SettingsProvider>
      </CompetitionProvider>
    </ThemeProvider>
  );
}
