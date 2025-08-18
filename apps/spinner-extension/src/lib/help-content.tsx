/**
 * Help Content Configuration
 *
 * Centralized help content for all configuration options in the extension.
 */

export const helpContent = {
  // Competition Management
  competitions: {
    overview: {
      title: 'Competition Management',
      description: 'Organize and manage your raffle competitions',
      details: {
        content:
          'Competitions are individual raffle events with their own set of participants. You can have multiple competitions loaded and switch between them during live presentations.',
        tips: [
          'Keep competition names short and descriptive for easy identification',
          'You can have unlimited competitions stored',
          'Only one competition can be active in the spinner at a time',
          'Competitions are stored locally in your browser',
        ],
        warnings: [
          'Deleting a competition cannot be undone',
          'Large competitions (5000+ participants) may affect performance',
        ],
      },
    },
    csvUpload: {
      title: 'CSV File Upload',
      description: 'Import participants from a spreadsheet',
      details: {
        content:
          'Upload a CSV file containing participant information. The file should have columns for First Name, Last Name, and Ticket Number.',
        examples: ['FirstName,LastName,TicketNumber', 'John,Smith,001', 'Jane,Doe,002'],
        tips: [
          'Export from Excel or Google Sheets as CSV',
          'UTF-8 encoding is recommended for special characters',
          'The first row should contain column headers',
          'Ticket numbers must be unique within a competition',
        ],
        warnings: [
          'Maximum recommended file size is 10MB',
          'Files with more than 10,000 rows may take time to process',
        ],
      },
    },
    deleteCompetition: {
      title: 'Delete Competition',
      description: 'Permanently remove a competition',
      details: {
        content:
          'This action will permanently delete the selected competition and all its participant data. This cannot be undone.',
        warnings: [
          'This action is irreversible',
          'All participant data will be lost',
          'Session winners from this competition will remain in history',
        ],
      },
    },
  },

  // Column Mapping
  columnMapping: {
    overview: {
      title: 'Column Mapping',
      description: 'Match CSV columns to required fields',
      details: {
        content:
          'Column mapping tells the system which columns in your CSV file correspond to First Name, Last Name, and Ticket Number. The system will try to auto-detect common column names.',
        examples: [
          'First Name → FirstName, fname, given_name',
          'Last Name → LastName, lname, surname, family_name',
          'Ticket → TicketNumber, ticket_no, entry_number, id',
        ],
        tips: [
          'Save frequently used mappings for quick reuse',
          'The system learns from your choices over time',
          'You can set a default mapping for all imports',
        ],
      },
    },
    savedMappings: {
      title: 'Saved Mappings',
      description: 'Reusable column configurations',
      details: {
        content:
          'Save your column mappings to quickly apply them to future CSV imports. This is useful when you regularly receive files with the same format.',
        tips: [
          'Name your mappings based on the source (e.g., "Monthly Raffle Export")',
          'Set your most common mapping as default',
          'Mappings track usage count to help identify frequently used ones',
        ],
      },
    },
  },

  // Spinner Settings
  spinnerSettings: {
    minSpinDuration: {
      title: 'Minimum Spin Duration',
      description: 'How long the wheel spins before stopping',
      details: {
        content:
          'Sets the minimum time the spinner will rotate before revealing the winner. This creates suspense and ensures a visually appealing animation.',
        examples: [
          '3 seconds - Quick reveal for rapid draws',
          '5 seconds - Standard duration for most raffles',
          '10 seconds - Extended suspense for major prizes',
        ],
        tips: [
          'Longer durations build more anticipation',
          'Consider your audience attention span',
          'Test different durations during rehearsals',
        ],
      },
    },
    decelerationRate: {
      title: 'Deceleration Rate',
      description: 'How quickly the spinner slows down',
      details: {
        content:
          'Controls the easing curve of the spinner animation as it comes to a stop. This affects how natural and exciting the spin feels.',
        examples: [
          'Slow - Gradual slowdown, builds maximum suspense',
          'Medium - Balanced deceleration, feels natural',
          'Fast - Quick stop, minimal easing',
        ],
        tips: [
          'Slow deceleration works well with longer spin durations',
          'Medium is recommended for most use cases',
          'Fast can be used for rapid-fire drawings',
        ],
      },
    },
  },

  // Ticket Handling
  ticketHandling: {
    duplicates: {
      title: 'Duplicate Ticket Detection',
      description: 'Handling duplicate ticket numbers',
      details: {
        content:
          'When duplicate ticket numbers are detected during import, you can choose how to handle them. This ensures data integrity in your competition.',
        tips: [
          'Review duplicates carefully before proceeding',
          'Consider if duplicates are data entry errors',
          'The system will show you which entries are duplicated',
        ],
        warnings: [
          'Allowing duplicates may cause confusion during draws',
          'Only the first occurrence will be included if you proceed',
        ],
      },
    },
    nonNumeric: {
      title: 'Non-Numeric Tickets',
      description: 'Converting tickets with letters or symbols',
      details: {
        content:
          'The system only supports numeric ticket numbers. When non-numeric characters are detected, the system will extract only the digits.',
        examples: ['ABC123 → 123', 'T-456-X → 456', '#789 → 789', 'TICKET → (skipped, no numbers)'],
        tips: [
          'Review conversions before accepting',
          'Ensure converted numbers remain unique',
          'Consider updating your source data for consistency',
        ],
        warnings: [
          'Tickets with no numeric characters will be skipped',
          'Leading zeros will be removed (001 → 1)',
        ],
      },
    },
  },

  // Session Winners
  sessionWinners: {
    overview: {
      title: 'Session Winners',
      description: 'Track winners during your event',
      details: {
        content:
          'Session winners are automatically tracked during each browser session. This list helps you keep a record of all winners during your event.',
        tips: [
          'Winners are displayed in reverse chronological order',
          'The list persists until you close the browser tab',
          'You can take a screenshot for permanent records',
          'Export or copy the list before closing the session',
        ],
        warnings: [
          'Session data is temporary and will be lost when the tab closes',
          'Not suitable for permanent record keeping',
        ],
      },
    },
  },

  // Side Panel
  sidePanel: {
    overview: {
      title: 'Side Panel Display',
      description: 'The live presentation view for your audience',
      details: {
        content:
          'The side panel provides a clean, focused view of the spinner wheel for live presentations. It removes all configuration options to avoid distractions.',
        tips: [
          'Open in a separate window for dual-monitor setups',
          'Use fullscreen mode (F11) for maximum impact',
          'Test the display on your presentation screen beforehand',
          'The spinner automatically adapts to different screen sizes',
        ],
      },
    },
    ticketEntry: {
      title: 'Ticket Number Entry',
      description: 'Enter the winning ticket number',
      details: {
        content:
          'Type or paste the predetermined winning ticket number. The spinner will animate and land on this exact ticket.',
        tips: [
          'Double-check the ticket number before spinning',
          'Press Enter to quickly start the spin',
          'The system normalizes ticket numbers (removes leading zeros)',
        ],
        warnings: [
          'Ticket must exist in the current competition',
          'Non-existent tickets will show an error',
        ],
      },
    },
  },
};
