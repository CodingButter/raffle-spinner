# Sample CSV Files for Testing

This folder contains various CSV sample files to test different scenarios with the Raffle Spinner extension.

## Files Overview

### 1. `small-raffle.csv` (20 participants)

**Format:** Standard three-column format

- First Name, Last Name, Ticket Number
- Perfect for basic testing and demonstrations
- Uses simple sequential ticket numbers (001-020)

### 2. `medium-raffle.csv` (50 participants)

**Format:** Two-column format with combined name

- Full Name, Ticket
- Tests the column mapping functionality
- Uses "T" prefix ticket format (T001-T050)

### 3. `large-raffle-starter-limit.csv` (350 participants)

**Format:** Alternative column names

- FirstName, LastName, TicketNo
- Tests moderate size imports
- Uses sequential numbers (1001-1350)

### 4. `alternative-format.csv` (30 participants)

**Format:** Business format with extra data

- Name, Entry ID, Email
- Tests handling of extra columns
- Uses "Last, First" name format and ENT- prefix IDs
- Includes email addresses (which will be ignored)

### 5. `numeric-tickets.csv` (26 participants)

**Format:** All caps headers with numeric tickets

- FIRST, LAST, TICKET
- Tests case-insensitive column detection
- Uses large numeric ticket values (100, 200, etc.)

### 6. `duplicates-test.csv` (20 participants)

**Format:** Standard format with intentional duplicates

- First Name, Last Name, Ticket Number
- Contains duplicate ticket numbers: 002, 004, 005
- Perfect for testing duplicate detection and handling

### 7. `single-name-format.csv` (20 participants)

**Format:** Single name column format

- Participant Name, Reference Number
- Tests parsing when first/last names are combined
- Uses REF prefix format

## Large Performance Testing Files

### 8. `raffle-5k.csv` (5,000 participants)

**Format:** Standard format (first, last, ticket_number)

- Tickets: 10001-15000
- Tests performance with moderate datasets

### 9. `raffle-10k.csv` (10,000 participants)

**Format:** Standard format

- Tickets: 20001-30000
- Tests slot machine with large datasets

### 10. `raffle-25k.csv` (25,000 participants)

**Format:** Standard format

- Tickets: 50001-75000
- Advanced performance testing

### 11. `raffle-50k.csv` (50,000 participants)

**Format:** Standard format

- Tickets: 100001-150000
- Stress testing for Pro users

### 12. `raffle-100k.csv` (100,000 participants)

**Format:** Standard format

- Tickets: 200001-300000
- Maximum stress test (Pro plan only)

## Testing Scenarios

### Basic Functionality

- Use `small-raffle.csv` for initial testing
- Use `medium-raffle.csv` to test column mapping

### Subscription Limits

- Starter Plan: Limited to 300 participants
- Pro Plan: Unlimited participants
- Large files (5k+) require Pro plan
- Files >300 participants trigger upgrade prompts for Starter users

### Column Mapping Intelligence

- Test with different files to see how the system detects column mappings
- `alternative-format.csv` tests business-style formats
- `numeric-tickets.csv` tests case-insensitive detection

### Error Handling

- Use `duplicates-test.csv` to test duplicate ticket number detection
- Use `single-name-format.csv` to test name parsing flexibility

### Performance Testing

- `raffle-5k.csv` - Moderate performance test
- `raffle-10k.csv` - Standard performance benchmark
- `raffle-25k.csv` - Advanced performance test
- `raffle-50k.csv` - Stress test for smooth animation
- `raffle-100k.csv` - Maximum performance test (maintains 60fps)

## Column Mapping Examples

The extension should intelligently map these variations:

| File                           | First Name | Last Name | Ticket | Full Name |
| ------------------------------ | ---------- | --------- | ------ | --------- |
| small-raffle.csv               | ✓          | ✓         | ✓      | -         |
| medium-raffle.csv              | -          | -         | ✓      | ✓         |
| large-raffle-starter-limit.csv | ✓          | ✓         | ✓      | -         |
| alternative-format.csv         | -          | -         | ✓      | ✓         |
| numeric-tickets.csv            | ✓          | ✓         | ✓      | -         |
| duplicates-test.csv            | ✓          | ✓         | ✓      | -         |
| single-name-format.csv         | -          | -         | ✓      | ✓         |

## Usage Tips

1. **Start Small**: Begin testing with `small-raffle.csv`
2. **Test Mapping**: Try `alternative-format.csv` to verify column mapping works
3. **Test Limits**: Use `large-raffle-starter-limit.csv` to verify subscription enforcement
4. **Test Edge Cases**: Use `duplicates-test.csv` for error handling
5. **Performance**: Use the large file to ensure smooth animation with many participants

## Subscription Testing

- **Starter Plan**: Accepts up to 300 contestants
- **Pro Plan**: Unlimited contestants (tested up to 100k)
- Files with >300 contestants trigger upgrade prompts for Starter users

## Generating New Test Files

To regenerate the large sample files with different random names:

```bash
python3 generate_csvs.py
```

This creates fresh test data with randomized participant names while maintaining the same ticket number ranges.
