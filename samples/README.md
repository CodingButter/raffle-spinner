# Sample CSV Files for Testing

This directory contains sample CSV files for testing the Raffle Winner Spinner Chrome Extension.

## Pre-Generated Samples

### Small Samples (< 100 entries)

- **`simple-raffle.csv`** - 10 entries with basic First,Last,Ticket format
- **`standard-raffle.csv`** - 30 entries with FirstName,LastName,TicketNumber
- **`school-fundraiser.csv`** - 26 entries with ParticipantName,RaffleNumber
- **`multiple-tickets.csv`** - 40 entries showing participants with multiple tickets

### Medium Samples (50-100 entries)

- **`charity-gala.csv`** - 50 entries with Name,TicketNumber format
- **`corporate-event.csv`** - 75 entries with full_name,entry_code format

### Large Samples (1000+ entries)

- **`competition-1000.csv`** - 1,000 entries in standard format
- **`competition-5000.csv`** - 5,000 entries with full names and TK- prefix
- **`competition-multiple.csv`** - 500 entries with some people having multiple tickets

## CSV Formats Supported

The extension automatically detects various column naming conventions:

### Name Columns

- `First`, `Last`
- `FirstName`, `LastName`
- `first_name`, `last_name`
- `firstName`, `lastName`
- `Name`, `ParticipantName`, `full_name`

### Ticket Columns

- `Ticket`, `TicketNumber`, `ticket_number`
- `RaffleNumber`, `entry_code`
- `ticketNumber`, `EntryNumber`

## Generate Custom Samples

Use the included generator script to create custom sample files:

```bash
node generate-competition.js [options]
```

### Options

- `--count, -c <number>` - Number of entries (default: 100)
- `--format, -f <format>` - CSV format (see below)
- `--multiple, -m` - Enable multiple entries per person
- `--prefix, -p <string>` - Ticket number prefix (e.g., "TK-", "R", "#")
- `--output, -o <filename>` - Output filename

### Available Formats

- `simple` - First,Last,Ticket
- `standard` - FirstName,LastName,TicketNumber
- `underscore` - first_name,last_name,ticket_number
- `camelCase` - firstName,lastName,ticketNumber
- `fullname` - Name,TicketNumber
- `spaces` - First Name,Last Name,Ticket Number

### Examples

```bash
# Generate 1000 entries in standard format
node generate-competition.js --count 1000

# Generate 500 entries with full names and prefix
node generate-competition.js -c 500 -f fullname -p "RAFFLE"

# Generate competition with multiple entries per person
node generate-competition.js --count 2000 --multiple --prefix "TK-"

# Custom output filename
node generate-competition.js -c 100 -o my-raffle.csv
```

## Testing Scenarios

### Basic Testing

1. Use `simple-raffle.csv` for quick functionality tests
2. Test column detection with different formats

### Performance Testing

1. Use `competition-1000.csv` for standard performance tests
2. Use `competition-5000.csv` for stress testing
3. Monitor spinner performance with large datasets

### Edge Cases

1. `multiple-tickets.csv` - Test handling of duplicate names
2. Different column naming conventions
3. Various ticket number formats

## Import Instructions

1. Open the Chrome Extension
2. Click on Options page
3. Click "Upload CSV" button
4. Select a sample file
5. Verify column mapping (should auto-detect)
6. Create competition
7. Test the spinner!

## Notes

- All names in samples are randomly generated
- Ticket numbers are sequential for easy verification
- Multiple entry samples use realistic distribution (60% single, 25% double, etc.)
- Files use UTF-8 encoding
