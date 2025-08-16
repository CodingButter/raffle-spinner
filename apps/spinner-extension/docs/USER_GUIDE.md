# DrawDay Spinner Extension User Guide

## Table of Contents

- [Getting Started](#getting-started)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Competition Management](#competition-management)
- [Live Draw Process](#live-draw-process)
- [Session Management](#session-management)
- [Troubleshooting](#troubleshooting)

## Getting Started

The DrawDay Spinner Extension is designed for professional raffle companies to conduct live draws efficiently. After installation, access the spinner through Chrome's side panel for a clean, presentation-ready interface.

### Opening the Extension

1. Click the DrawDay icon in Chrome's toolbar
2. Select "Open Side Panel"
3. The spinner interface will appear on the right side of your browser

## Keyboard Shortcuts

The extension supports comprehensive keyboard shortcuts for efficient operation during live draws. All shortcuts are disabled when typing in input fields.

### Quick Reference

Press `?` or `H` at any time to display the keyboard shortcuts help modal.

### Spinner Controls

- **Space** or **Enter**: Start/Stop spinning the wheel
- **R**: Reset the spinner to initial state
- **W**: Reveal winner (when spin is complete)

### Session Management

- **N**: Start a new session (clears current winners)
- **E**: Export session winners to CSV
- **Shift+C**: Clear all session winners
- **C**: Open competition selector

### Navigation

- **S**: Open settings panel
- **Esc**: Close any open modal or dialog
- **?** or **H**: Show keyboard shortcuts help

### Modifier Keys

Some shortcuts require modifier keys:

- **Shift+C**: Clear winners (requires Shift to prevent accidental clearing)

## Competition Management

### Importing Competitions

1. Click "Select Competition" or press **C**
2. Choose "Import from CSV"
3. Select your CSV file containing participant data
4. Map columns to First Name, Last Name, and Ticket Number
5. Name your competition and save

### CSV Format Requirements

Your CSV should include:

- First Name (or Full Name)
- Last Name (if not using Full Name)
- Ticket Number (unique identifier)

The system intelligently detects common column names and variations.

### Managing Multiple Competitions

- Store multiple competitions for different events
- Switch between competitions quickly using the selector
- Each competition maintains its own settings and participant list

## Live Draw Process

### Conducting a Draw

1. Select your competition
2. Press **Space** to start the spin
3. The wheel will spin for the configured duration
4. Winner is automatically displayed when spin completes
5. Winner is added to the session history

### Session Winners

- All winners are tracked during your session
- View the complete list in the Session Winners panel
- Export winners at any time with **E**
- Start fresh with **N** for a new session

### Visual Features

- Full-screen spinner animation
- Confetti celebration on winner selection
- Customizable colors and branding (Pro features)
- Professional presentation mode

## Session Management

### Session Persistence

The extension automatically saves your session state, including:

- Selected competition
- Session winners list
- Current winner display
- Spinner position

Sessions persist for 24 hours or until manually cleared.

### Exporting Winners

Press **E** or click "Export Winners" to download a CSV containing:

- Winner names
- Ticket numbers
- Competition name
- Timestamp of each draw

### Starting New Sessions

Press **N** to:

- Clear the current winners list
- Reset the session timestamp
- Maintain your selected competition

## Troubleshooting

### Common Issues

#### Keyboard Shortcuts Not Working

- Ensure you're not typing in an input field
- Check that no modal is open (press Esc to close)
- Verify the side panel has focus

#### CSV Import Issues

- Ensure ticket numbers are unique
- Check for proper CSV formatting
- Verify file encoding (UTF-8 recommended)

#### Performance Issues

- Large competitions (5000+ participants) require adequate system resources
- Close unnecessary browser tabs
- Ensure Chrome has sufficient memory allocated

### Getting Help

- Press **?** for keyboard shortcuts reference
- Visit [drawday.app/support](https://drawday.app/support) for documentation
- Contact support@drawday.app for assistance

## Subscription Features

### Starter Plan

- Up to 1,000 contestants per competition
- 5 competitions maximum
- Basic spinner functionality

### Basic Plan

- Up to 5,000 contestants per competition
- 50 competitions maximum
- Custom colors and themes

### Pro Plan

- Unlimited contestants
- Unlimited competitions
- Full customization options
- API access
- Priority support

### Enterprise Plan

- All Pro features
- Custom branding
- Dedicated support
- Custom integrations

## Tips for Live Events

1. **Test Before Going Live**: Import your data and test spins before the event
2. **Use Keyboard Shortcuts**: Faster than clicking during live presentations
3. **Keep Sessions Organized**: Start new sessions for different prize categories
4. **Export Regularly**: Save winner data after each major prize draw
5. **Full Screen Mode**: F11 for distraction-free presentations

## Privacy & Security

- All data is stored locally in Chrome
- No participant data is sent to external servers
- Sessions expire after 24 hours for security
- Export files are saved to your local Downloads folder

---

For additional support or feature requests, please visit [drawday.app](https://drawday.app) or contact our support team.
