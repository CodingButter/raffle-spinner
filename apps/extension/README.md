# @raffle-spinner/extension

Chrome Extension for the Raffle Winner Spinner application.

## Overview

A Chrome Extension that provides a fair and transparent way to select raffle winners from CSV data. Features include an intuitive options page for data management and a side panel with an interactive spinning wheel.

## Features

### Options Page
- CSV file upload with drag-and-drop support
- Intelligent column mapping with auto-detection
- Competition management (create, edit, delete)
- Data validation with detailed error reporting
- Settings configuration

### Side Panel
- Interactive spinning wheel visualization
- Real-time winner selection with physics-based animation
- Session tracking and winner history
- Multiple winner selection support
- Export functionality for results

## Installation

### Development

1. Build the extension:
```bash
pnpm build
```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `apps/extension/dist` directory

### Production

The build process creates a `raffle-spinner-extension.zip` file ready for Chrome Web Store submission.

## Usage

### Setting Up a Raffle

1. Click the extension icon and select "Options"
2. Upload a CSV file containing participant data
3. Map columns to participant names and ticket numbers
4. Create a new competition with a descriptive name
5. Review the imported data for accuracy

### Running the Raffle

1. Open the side panel by clicking the extension icon
2. Select the active competition
3. Click the "Spin" button to start the wheel
4. The wheel will spin and land on a winner
5. Winner information is displayed and saved
6. Continue spinning for multiple winners

### CSV Format

The extension accepts CSV files with flexible column naming:

```csv
Name,Ticket Number,Email
John Doe,12345,john@example.com
Jane Smith,67890,jane@example.com
```

Supported column variations:
- Name: "name", "participant", "customer", "winner"
- Ticket: "ticket", "number", "entry", "code"
- Email: "email", "mail", "contact" (optional)

## Architecture

### Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling
- **Vite**: Build tool
- **Chrome Extensions Manifest V3**: Extension framework

### Project Structure

```
apps/extension/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   ├── options/     # Options page
│   │   └── sidepanel/   # Side panel
│   ├── utils/           # Utility functions
│   └── app.css          # Global styles
├── public/
│   └── manifest.json    # Extension manifest
├── scripts/
│   ├── build-extension.cjs    # Build script
│   └── generate-icons.cjs     # Icon generation
└── dist/                # Built extension
```

### Components

#### Options Page Components

- **CSVUploader**: Handles file upload and parsing
- **ColumnMapper**: Maps CSV columns to data fields
- **CompetitionManager**: CRUD operations for competitions
- **SettingsPanel**: Application settings

#### Side Panel Components

- **SpinnerWheel**: Canvas-based wheel visualization
- **WinnerDisplay**: Shows selected winner
- **SessionTracker**: Tracks spinning session
- **ControlPanel**: Spin controls and options

## Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Chrome browser

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Scripts

- `pnpm dev`: Start development server with HMR
- `pnpm build`: Build extension and create ZIP
- `pnpm lint`: Run ESLint
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm format`: Format code with Prettier

### Chrome Extension APIs Used

- **Storage API**: Data persistence
- **SidePanel API**: Side panel functionality
- **Action API**: Extension icon interaction
- **Runtime API**: Message passing

## Configuration

### Manifest Permissions

```json
{
  "permissions": [
    "storage",
    "sidePanel"
  ]
}
```

### Build Configuration

The extension uses Vite for building with the following optimizations:
- Code splitting for options and side panel
- Tree shaking for smaller bundle size
- Minification for production builds
- Source maps for debugging

## Testing

### Manual Testing

1. Load the extension in Chrome
2. Test CSV upload with various formats
3. Verify column mapping works correctly
4. Create and manage competitions
5. Test spinner with different participant counts
6. Verify winner selection and history

### Test Data

Sample CSV files are provided in the `test-data/` directory:
- `small-raffle.csv`: 10 participants
- `medium-raffle.csv`: 100 participants
- `large-raffle.csv`: 5000+ participants

## Performance

### Optimizations

- Virtual scrolling for large participant lists
- Canvas rendering for smooth animations
- Efficient data structures for fast lookups
- Debounced search and filter operations
- Lazy loading of components

### Benchmarks

- Handles 5000+ participants smoothly
- 60fps spinner animation
- Sub-second CSV parsing
- Instant winner selection

## Troubleshooting

### Common Issues

#### Extension Not Loading
- Ensure developer mode is enabled
- Check for manifest syntax errors
- Verify all required files are present

#### CSV Upload Fails
- Check CSV file encoding (UTF-8 recommended)
- Ensure required columns are present
- Verify no special characters in headers

#### Spinner Performance Issues
- Reduce participant count if needed
- Close other Chrome tabs
- Check Chrome GPU acceleration settings

## Security

- All data stored locally in Chrome storage
- No external API calls
- No tracking or analytics
- CSV data validated before processing
- XSS protection in all user inputs

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## Future Enhancements

- [ ] Multiple wheel themes
- [ ] Sound effects
- [ ] Prize tier support
- [ ] Bulk winner selection
- [ ] Cloud backup support
- [ ] Mobile app companion
- [ ] API integration options

## License

Part of the Raffle Winner Spinner project.

## Support

For issues or questions, please open an issue in the main repository.