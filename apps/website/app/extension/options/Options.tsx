'use client';

/**
 * Options Component (Website Integration)
 *
 * Purpose: Data management interface for competitions, integrated into the website
 * with localStorage bridge for extension compatibility.
 *
 * Integration Features:
 * - localStorage persistence for competition data
 * - CSV import with error handling and duplicate detection
 * - Data validation with ticket number uniqueness
 * - Seamless sync with sidepanel page
 */

import { useState, useEffect } from 'react';
import { CompetitionProvider } from '@/contexts/CompetitionContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Alert } from '@drawday/ui';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Users,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Competition, Participant } from '@raffle-spinner/storage';

interface LocalStorageData {
  competitions: Competition[];
  settings: any;
  selectedCompetitionId: string | null;
}

// Simple CSV parsing function for website integration
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

export function Options() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [newCompetitionName, setNewCompetitionName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Initialize localStorage bridge
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const stored = localStorage.getItem('raffleSpinnerData');
      if (stored) {
        const data: LocalStorageData = JSON.parse(stored);
        setCompetitions(data.competitions || []);
        if (data.selectedCompetitionId) {
          const selected = data.competitions.find((c) => c.id === data.selectedCompetitionId);
          setSelectedCompetition(selected || null);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setErrorMessage('Failed to load competition data');
    }
  };

  const saveData = (newCompetitions: Competition[], selectedId?: string) => {
    try {
      const data: LocalStorageData = {
        competitions: newCompetitions,
        settings: {}, // Placeholder for settings
        selectedCompetitionId: selectedId || selectedCompetition?.id || null,
      };
      localStorage.setItem('raffleSpinnerData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
      setErrorMessage('Failed to save competition data');
    }
  };

  const createCompetition = () => {
    if (!newCompetitionName.trim()) return;

    const newCompetition: Competition = {
      id: `comp_${Date.now()}`,
      name: newCompetitionName.trim(),
      participants: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [...competitions, newCompetition];
    setCompetitions(updated);
    saveData(updated);
    setNewCompetitionName('');
  };

  const deleteCompetition = (id: string) => {
    const updated = competitions.filter((c) => c.id !== id);
    setCompetitions(updated);
    if (selectedCompetition?.id === id) {
      setSelectedCompetition(null);
    }
    saveData(updated);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setImportStatus('processing');
    setErrorMessage('');

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setImportStatus('success');
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  const importParticipants = (competitionId: string) => {
    if (!csvData.length) return;

    const competition = competitions.find((c) => c.id === competitionId);
    if (!competition) return;

    // Convert CSV data to participants with duplicate detection
    const existingTickets = new Set(competition.participants.map((p) => p.ticketNumber));
    const newParticipants: Participant[] = [];
    let duplicates = 0;

    csvData.forEach((row) => {
      const participant: Participant = {
        firstName: row.firstName || row['First Name'] || '',
        lastName: row.lastName || row['Last Name'] || '',
        ticketNumber: row.ticketNumber || row['Ticket Number'] || row.ticket || '',
      };

      if (participant.ticketNumber && !existingTickets.has(participant.ticketNumber)) {
        newParticipants.push(participant);
        existingTickets.add(participant.ticketNumber);
      } else if (existingTickets.has(participant.ticketNumber)) {
        duplicates++;
      }
    });

    // Update competition
    const updatedCompetition = {
      ...competition,
      participants: [...competition.participants, ...newParticipants],
      updatedAt: Date.now(),
    };

    const updatedCompetitions = competitions.map((c) =>
      c.id === competitionId ? updatedCompetition : c
    );

    setCompetitions(updatedCompetitions);
    saveData(updatedCompetitions);
    setDuplicateCount(duplicates);
    setCsvData([]);
    setCsvFile(null);
  };

  const exportCompetitionData = (competition: Competition) => {
    const csv = [
      ['First Name', 'Last Name', 'Ticket Number'],
      ...competition.participants.map((p) => [p.firstName, p.lastName, p.ticketNumber]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${competition.name}-participants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competition Manager</h1>
        <p className="text-muted-foreground">
          Manage competitions and participant data for your raffles
        </p>
      </div>

      {errorMessage && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-2">{errorMessage}</div>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Competition Management Section */}
        <div className="space-y-6">
          {/* Create New Competition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Competition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="competition-name">Competition Name</Label>
                  <Input
                    id="competition-name"
                    value={newCompetitionName}
                    onChange={(e) => setNewCompetitionName(e.target.value)}
                    placeholder="Enter competition name..."
                    onKeyDown={(e) => e.key === 'Enter' && createCompetition()}
                  />
                </div>
                <Button onClick={createCompetition} disabled={!newCompetitionName.trim()}>
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Competitions List */}
          <div className="grid gap-4">
            {competitions.map((competition) => (
              <Card key={competition.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      {competition.name}
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        <Users className="h-3 w-3 inline mr-1" />
                        {competition.participants.length}
                      </span>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportCompetitionData(competition)}
                        disabled={competition.participants.length === 0}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCompetition(competition.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Created: {new Date(competition.createdAt).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedCompetition(competition)}>
                      Select for Import
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Import Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCompetition && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <div className="ml-2">Please select a competition first from above.</div>
              </Alert>
            )}

            {selectedCompetition && (
              <>
                <div>
                  <Label htmlFor="csv-upload">Upload CSV File</Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    CSV should contain columns: First Name, Last Name, Ticket Number
                  </p>
                </div>

                {csvData.length > 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <div className="ml-2 flex items-center justify-between w-full">
                      <span>
                        Ready to import {csvData.length} participants to "{selectedCompetition.name}
                        "
                      </span>
                      <Button
                        className="ml-4"
                        onClick={() => importParticipants(selectedCompetition.id)}
                      >
                        Import Now
                      </Button>
                    </div>
                  </Alert>
                )}

                {duplicateCount > 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4" />
                    <div className="ml-2">
                      {duplicateCount} duplicate ticket numbers were skipped during import.
                    </div>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
