#!/usr/bin/env node

/**
 * Generate Competition Sample CSV
 *
 * @description
 * Creates realistic raffle competition CSV files for testing purposes.
 * Supports multiple formats, participant counts, and ticket numbering schemes.
 *
 * @module samples/generate-competition
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { logger } from "@raffle-spinner/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Common first names for realistic data generation
 */
const firstNames: readonly string[] = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Dorothy",
  "Donald",
  "Sandra",
  "Mark",
  "Ashley",
  "Paul",
  "Kimberly",
  "Steven",
  "Donna",
  "Andrew",
  "Emily",
  "Kenneth",
  "Michelle",
  "Joshua",
  "Carol",
  "Kevin",
  "Amanda",
  "Brian",
  "Melissa",
  "George",
  "Deborah",
  "Edward",
  "Stephanie",
  "Ronald",
  "Rebecca",
  "Timothy",
  "Laura",
  "Jason",
  "Sharon",
  "Jeffrey",
  "Cynthia",
  "Ryan",
  "Amy",
  "Jacob",
  "Kathleen",
  "Gary",
  "Shirley",
  "Nicholas",
  "Angela",
  "Eric",
  "Helen",
  "Stephen",
  "Anna",
  "Jonathan",
  "Brenda",
  "Larry",
  "Pamela",
  "Justin",
  "Nicole",
  "Scott",
  "Samantha",
  "Brandon",
  "Katherine",
  "Frank",
  "Emma",
  "Benjamin",
  "Ruth",
  "Gregory",
  "Christine",
  "Samuel",
  "Catherine",
  "Raymond",
  "Virginia",
  "Patrick",
  "Debra",
  "Alexander",
  "Rachel",
  "Jack",
  "Janet",
];

/**
 * Common last names for realistic data generation
 */
const lastNames: readonly string[] = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
  "Cruz",
  "Edwards",
  "Collins",
  "Reyes",
  "Stewart",
  "Morris",
  "Morales",
  "Murphy",
  "Cook",
  "Rogers",
  "Gutierrez",
  "Ortiz",
  "Morgan",
  "Cooper",
  "Peterson",
  "Bailey",
  "Reed",
  "Kelly",
  "Howard",
  "Ramos",
  "Kim",
  "Cox",
  "Ward",
  "Richardson",
  "Watson",
  "Brooks",
  "Chavez",
  "Wood",
  "James",
  "Bennett",
  "Gray",
  "Mendoza",
  "Ruiz",
  "Hughes",
  "Price",
  "Alvarez",
  "Castillo",
  "Sanders",
  "Patel",
  "Myers",
];

/**
 * Different ticket prefix options
 */
const ticketPrefixes: readonly string[] = [
  "",
  "TK-",
  "R",
  "TICKET",
  "NUM",
  "ENTRY",
  "#",
];

/**
 * CSV format definition interface
 */
interface CsvFormat {
  headers: string;
  getRow: (first: string, last: string, ticket: string) => string;
}

/**
 * Different CSV format options
 */
const formats: Record<string, CsvFormat> = {
  simple: {
    headers: "First,Last,Ticket",
    getRow: (first, last, ticket) => `${first},${last},${ticket}`,
  },
  standard: {
    headers: "FirstName,LastName,TicketNumber",
    getRow: (first, last, ticket) => `${first},${last},${ticket}`,
  },
  underscore: {
    headers: "first_name,last_name,ticket_number",
    getRow: (first, last, ticket) => `${first},${last},${ticket}`,
  },
  camelCase: {
    headers: "firstName,lastName,ticketNumber",
    getRow: (first, last, ticket) => `${first},${last},${ticket}`,
  },
  fullname: {
    headers: "Name,TicketNumber",
    getRow: (first, last, ticket) => `${first} ${last},${ticket}`,
  },
  spaces: {
    headers: "First Name,Last Name,Ticket Number",
    getRow: (first, last, ticket) => `${first},${last},${ticket}`,
  },
};

/**
 * Generation options interface
 */
interface GenerationOptions {
  count: number;
  format: string;
  multipleEntries: boolean;
  multipleEntriesMax?: number;
  prefix: string;
  output?: string | null;
}

/**
 * Generate a ticket number with various formats
 *
 * @param index - The ticket index
 * @param prefix - Optional prefix for the ticket
 * @returns Formatted ticket number
 */
function generateTicket(index: number, prefix: string = ""): string {
  // Different ticket formats
  const ticketFormats = [
    () => `${prefix}${String(index).padStart(4, "0")}`, // 0001
    () => `${prefix}${String(index).padStart(6, "0")}`, // 000001
    () => `${prefix}${2024000 + index}`, // 2024001
    () => `${prefix}${String(index)}`, // 1
    () => `${prefix}${1000 + index}`, // 1001
    () =>
      `${prefix}${String.fromCharCode(65 + Math.floor(index / 1000))}${String(index % 1000).padStart(3, "0")}`, // A001
  ];

  // Pick a consistent format based on prefix
  const formatIndex = prefix ? ticketPrefixes.indexOf(prefix) : 0;
  return ticketFormats[formatIndex % ticketFormats.length]();
}

/**
 * Generate a competition CSV with specified options
 *
 * @param options - Generation options
 * @returns CSV string content
 */
function generateCompetition(options: Partial<GenerationOptions> = {}): string {
  const {
    count = 100,
    format = "standard",
    multipleEntries = false,
    multipleEntriesMax = 5,
    prefix = "",
  } = options;

  const selectedFormat = formats[format] || formats.standard;
  const rows = [selectedFormat.headers];

  let ticketCounter = 1;
  let participantCount = 0;

  while (participantCount < count) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    // Determine number of entries for this participant
    let entries = 1;
    if (multipleEntries) {
      // 60% have 1 entry, 25% have 2, 10% have 3, 5% have more
      const rand = Math.random();
      if (rand < 0.6) entries = 1;
      else if (rand < 0.85) entries = 2;
      else if (rand < 0.95) entries = 3;
      else entries = Math.floor(Math.random() * (multipleEntriesMax - 3)) + 4;
    }

    // Add entries for this participant
    for (let i = 0; i < entries && participantCount < count; i++) {
      const ticket = generateTicket(ticketCounter, prefix);
      rows.push(selectedFormat.getRow(firstName, lastName, ticket));
      ticketCounter++;
      participantCount++;
    }
  }

  return rows.join("\n");
}

/**
 * Display help information
 */
function showHelp(): void {
  const helpText = `
Generate Competition Sample CSV Files

Usage: tsx generate-competition.ts [options]

Options:
  --count, -c <number>      Number of entries (default: 100)
  --format, -f <format>     CSV format: simple, standard, underscore, camelCase, fullname, spaces (default: standard)
  --multiple, -m            Enable multiple entries per person
  --prefix, -p <string>     Ticket number prefix (e.g., "TK-", "R", "#")
  --output, -o <filename>   Output filename (default: auto-generated)
  --help, -h                Show this help message

Examples:
  tsx generate-competition.ts --count 1000
  tsx generate-competition.ts -c 500 -f fullname -p "TK-"
  tsx generate-competition.ts --count 5000 --multiple --prefix "RAFFLE"
`;

  // Use process.stdout.write for help text (acceptable for CLI tools)
  process.stdout.write(helpText);
}

/**
 * Main function to generate competition CSV
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
  }

  // Parse arguments
  const options: GenerationOptions = {
    count: 100,
    format: "standard",
    multipleEntries: false,
    prefix: "",
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--count":
      case "-c":
        options.count = parseInt(args[++i]) || 100;
        break;
      case "--format":
      case "-f":
        options.format = args[++i] || "standard";
        break;
      case "--multiple":
      case "-m":
        options.multipleEntries = true;
        break;
      case "--prefix":
      case "-p":
        options.prefix = args[++i] || "";
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
    }
  }

  // Generate filename if not provided
  if (!options.output) {
    const parts = ["competition"];
    if (options.count !== 100) parts.push(`${options.count}`);
    if (options.format !== "standard") parts.push(options.format);
    if (options.multipleEntries) parts.push("multiple");
    if (options.prefix) parts.push(options.prefix.replace(/[^a-zA-Z0-9]/g, ""));
    options.output = `${parts.join("-")}.csv`;
  }

  logger.info("Generating competition CSV", {
    component: "generate-competition",
    metadata: {
      format: options.format,
      entries: options.count,
      multipleEntries: options.multipleEntries,
      ticketPrefix: options.prefix || "(none)",
    },
  });

  // Generate CSV
  const csv = generateCompetition(options);

  // Write file
  const filepath = join(__dirname, options.output);
  writeFileSync(filepath, csv, "utf8");

  // Report
  const sizeInBytes = Buffer.byteLength(csv, "utf8");
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);

  logger.info("CSV generation complete", {
    component: "generate-competition",
    metadata: {
      filename: options.output,
      sizeKB: sizeInKB,
      location: filepath,
    },
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateCompetition, generateTicket, GenerationOptions };
