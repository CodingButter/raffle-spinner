# @raffle-spinner/csv-parser

CSV parsing utilities for the Raffle Winner Spinner Chrome Extension.

## Overview

This package provides intelligent CSV parsing with automatic column detection, data validation, and duplicate handling for participant data.

## Features

- Automatic column detection for participant names and ticket numbers
- Support for various CSV formats and delimiters
- Duplicate ticket detection and handling
- Data validation with detailed error reporting
- Efficient parsing of large files (5000+ rows)
- TypeScript support with full type safety

## Installation

This package is part of the Raffle Winner Spinner monorepo and is not published to npm.

```bash
pnpm add @raffle-spinner/csv-parser
```

## Usage

```typescript
import { CSVParser } from '@raffle-spinner/csv-parser';
import type { ColumnMapping, ParseResult } from '@raffle-spinner/csv-parser';

const parser = new CSVParser();

// Parse with automatic column detection
const result = await parser.parse(file);

// Parse with manual column mapping
const mapping: ColumnMapping = {
  name: 'Full Name',
  ticketNumber: 'Ticket',
  email: 'Email Address', // optional
};

const resultWithMapping = await parser.parse(file, mapping);

// Handle results
if (result.participants.length > 0) {
  console.log(`Parsed ${result.participants.length} participants`);
  console.log(`Total tickets: ${result.totalTickets}`);

  if (result.duplicates.length > 0) {
    console.warn(`Found ${result.duplicates.length} duplicate tickets`);
  }
}
```

## API Reference

### CSVParser

#### Methods

##### `parse(file: File, mapping?: ColumnMapping): Promise<ParseResult>`

Parses a CSV file and returns structured participant data.

- `file`: The CSV file to parse
- `mapping`: Optional column mapping. If not provided, columns are auto-detected
- Returns: Promise resolving to ParseResult

##### `detectColumns(headers: string[]): ColumnMapping`

Automatically detects column mappings from CSV headers.

- `headers`: Array of column headers from the CSV
- Returns: ColumnMapping object with detected columns

### Types

```typescript
interface ColumnMapping {
  name: string;
  ticketNumber: string;
  email?: string;
}

interface ParseResult {
  participants: Participant[];
  totalTickets: number;
  duplicates: string[];
  errors: ParseError[];
  skippedRows: number;
}

interface Participant {
  id: string;
  name: string;
  ticketNumbers: string[];
  email?: string;
}

interface ParseError {
  row: number;
  message: string;
  data?: Record<string, string>;
}
```

## Column Detection Algorithm

The parser uses intelligent pattern matching to automatically identify columns:

### Name Column Detection

Looks for headers containing:

- "name"
- "participant"
- "winner"
- "person"
- "customer"
- "attendee"

### Ticket Column Detection

Looks for headers containing:

- "ticket"
- "number"
- "entry"
- "raffle"
- "id"
- "code"

### Email Column Detection

Looks for headers containing:

- "email"
- "mail"
- "contact"

## Data Validation

The parser performs the following validations:

1. **Required Fields**: Ensures name and ticket number are present
2. **Duplicate Detection**: Identifies duplicate ticket numbers
3. **Data Cleaning**: Trims whitespace and normalizes data
4. **Empty Row Handling**: Skips empty rows automatically
5. **Error Reporting**: Provides detailed error messages for invalid data

## Performance Considerations

- Efficiently handles files with 5000+ participants
- Streaming parsing for large files
- Memory-efficient data structures
- Optimized duplicate detection using Map

## Examples

### Basic Usage

```typescript
const parser = new CSVParser();
const fileInput = document.getElementById('csvFile') as HTMLInputElement;
const file = fileInput.files[0];

try {
  const result = await parser.parse(file);
  console.log('Participants:', result.participants);
} catch (error) {
  console.error('Parse error:', error);
}
```

### With Manual Column Mapping

```typescript
const mapping: ColumnMapping = {
  name: 'Customer Name',
  ticketNumber: 'Entry Code',
  email: 'Contact Email',
};

const result = await parser.parse(file, mapping);
```

### Handling Duplicates

```typescript
const result = await parser.parse(file);

if (result.duplicates.length > 0) {
  // Show warning to user
  alert(`Warning: ${result.duplicates.length} duplicate tickets found!`);

  // Log duplicate ticket numbers
  result.duplicates.forEach((ticket) => {
    console.warn(`Duplicate ticket: ${ticket}`);
  });
}
```

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

### Type Checking

```bash
pnpm typecheck
```

## Error Handling

The parser provides detailed error information:

```typescript
try {
  const result = await parser.parse(file);

  if (result.errors.length > 0) {
    result.errors.forEach((error) => {
      console.error(`Row ${error.row}: ${error.message}`);
    });
  }
} catch (error) {
  // File read error or parse failure
  console.error('Failed to parse CSV:', error);
}
```

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Part of the Raffle Winner Spinner project.
