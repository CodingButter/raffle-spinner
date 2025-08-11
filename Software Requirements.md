# **Software Requirements Specification (SRS): Raffle Winner Spinner**

- **Version:** 3.0 (Definitive MVP)
- **Date:** August 11, 2025
- **Status:** Approved for Development

## **1.0 Introduction**

### **1.1 Purpose**

This document provides a detailed specification of the requirements for the "Raffle Winner Spinner" Chrome Extension. It is intended for use by the development team, project managers, and quality assurance testers to ensure a common understanding of the product's functionality and constraints.

### **1.2 Scope**

The scope of this document is limited to the Minimum Viable Product (MVP) of the extension. It covers two primary components: the **Side Panel** for live draws and the **Options Page** for configuration. All features detailed herein are considered mandatory for the MVP release. Features designated for future releases are explicitly listed as out-of-scope.

### **1.3 Glossary**

- **Competition:** A single raffle event, represented by a named list of participants and their ticket numbers, loaded from a CSV file.
- **Participant:** An individual entry in a competition, consisting of a First Name, Last Name, and a unique Ticket Number.
- **Side Panel:** The primary user interface for the extension, used during a live draw.
- **Options Page:** The configuration and management interface for the extension.
- **SRS:** Software Requirements Specification.
- **MVP:** Minimum Viable Product.

## **2.0 Overall Description**

### **2.1 Product Perspective**

The Raffle Winner Spinner is a Chrome extension that functions as a client-side browser enhancement. It operates independently, with all data stored locally within the user's browser. It is designed to run in a side panel, allowing it to be used concurrently with other web pages, such as a live streaming platform or a random number generator.

### **2.2 System Architecture Overview**

The system is composed of three logical layers:

1. **Presentation Layer (UI):** Consists of React components for the Side Panel and Options Page. Styled with Tailwind CSS.
2. **Business Logic Layer:** Manages application state, CSV parsing, data validation, and spinner animation logic.
3. **Data Layer:** Interacts with the chrome.storage.local API via a dedicated data abstraction wrapper. This insulates the application from the specific storage mechanism, simplifying future migration to a backend server.

### **2.3 User Classes and Characteristics**

The primary user is a **Raffle Administrator**. This user is expected to be proficient with using a web browser and managing files (e.g., uploading a CSV) but is not expected to have technical expertise.

## **3.0 Detailed Functional Requirements**

### **3.1 FR-1: The Options Page**

#### FR-1.1: Accessing the Options Page

- **Description:** The user must be able to access a dedicated page for all extension configuration.
- **Requirements:**
  1. The extension's manifest.json shall define an options_page pointing to the main application entry point.
  2. Users can access this page by right-clicking the extension icon and selecting "Options" or through the Chrome Extensions management page.
- **Acceptance Criteria:** The Options Page loads successfully and displays the main configuration interface.

#### FR-1.2: Competition Management

- **Description:** A central area on the Options Page for uploading and managing all competitions.
- **Requirements:**
  1. The UI shall contain a distinct "Competition Management" section.
  2. This section will feature a file upload control and a list of currently saved competitions.
  3. Each item in the list shall display the competition's user-defined name and the number of participants.
  4. Each list item must have a "Delete" button associated with it (see FR-1.6).
- **UI/UX:** A clean card-based or list-based layout. An "Upload New Competition" button should be prominent.

#### FR-1.3: CSV Upload Process

- **Description:** The user flow for importing a new competition from a CSV file.
- **Requirements:**
  1. The user initiates the process via a file input (\<input type="file" accept=".csv"\>).
  2. Upon file selection, a modal or inline form shall appear, prompting the user to enter a **Competition Name**.
  3. The Competition Name field is mandatory. The "Save" button shall be disabled until a name is provided.
  4. Upon saving, the system will trigger the CSV parsing and mapping process (see FR-1.4).
- **Acceptance Criteria:** A user can select a CSV file, name it, and save it, resulting in a new entry in the competition list.

#### FR-1.4: CSV Column Mapper

- **Description:** A crucial feature allowing users to map columns from their unique CSV files to the application's required data fields.
- **Requirements:**
  1. The first time a user uploads a CSV (or via a "Configure Mapping" button), they are presented with the Column Mapper interface.
  2. The interface shall display the headers detected in the uploaded CSV file.
  3. For each required data field ("First Name," "Last Name," "Ticket Number"), a dropdown menu will be provided.
  4. Each dropdown will be populated with the list of headers from the user's CSV.
  5. The system will attempt to **intelligently pre-select** the correct mapping based on common header names (e.g., if a header is "fname" or "first_name", it should be pre-selected for the "First Name" field).
  6. The user can override any pre-selection.
  7. This mapping configuration shall be saved and used for all subsequent CSV uploads until it is modified by the user.
- **Acceptance Criteria:** A user can successfully map columns from a non-standard CSV, and the data is imported correctly. The mapping persists for future uploads.

#### FR-1.5: Data Validation & Error Handling

- **Description:** Logic to handle malformed or problematic data within an uploaded CSV.
- **Requirements:**
  1. **Duplicate Ticket Numbers:** During parsing, the system must check for duplicate ticket numbers within the file. If duplicates are found, a warning modal will appear, listing the duplicate ticket numbers and the corresponding names. The user will be given the option to either **Cancel** the upload or **Proceed** (in which case, only the first instance of the ticket number is kept).
  2. **Missing Data:** If a row is missing data in a mapped column (e.g., no First Name), that row shall be skipped during import.
  3. **Post-Import Summary:** After an import is complete, a summary message shall be displayed, stating: "Success\! X participants imported. Y rows were skipped due to missing data."
- **Acceptance Criteria:** The system correctly identifies duplicates and handles them based on user choice. It correctly skips and reports on rows with missing data.

#### FR-1.6: Deleting Competitions

- **Description:** The user must be able to remove competitions they no longer need.
- **Requirements:**
  1. Each competition listed in the management UI will have a "Delete" icon/button.
  2. Clicking "Delete" will trigger a confirmation modal to prevent accidental deletion. The modal will ask, "Are you sure you want to delete \[Competition Name\]?"
  3. Upon confirmation, the competition and all its associated participant data will be permanently removed from chrome.storage.local.
- **Acceptance Criteria:** A user can successfully delete a competition, and it is removed from all selection menus.

#### FR-1.7: Spinner Physics Configuration

- **Description:** Allows the user to customize the look and feel of the spinner animation.
- **Requirements:**
  1. A "Spinner Settings" section will be available on the Options Page.
  2. It will contain controls (e.g., sliders) for the following parameters:
     - **Minimum Spin Duration (in seconds):** Defines the shortest possible time for the animation.
     - **Deceleration Rate:** A value that controls how quickly the wheel slows down (e.g., "Slow," "Medium," "Fast").
  3. These settings are saved to chrome.storage.local and applied to all spin animations.
- **Acceptance Criteria:** Changing the settings on the Options Page visibly alters the behavior of the spin animation in the Side Panel.

### **3.2 FR-2: The Side Panel**

#### FR-2.1: Competition Selection

- **Description:** The user must be able to choose which competition is active in the spinner.
- **Requirements:**
  1. The Side Panel shall feature a dropdown menu at the top.
  2. This dropdown will be populated with the names of all competitions saved in chrome.storage.local.
  3. Selecting a competition from the dropdown will immediately update the spinner wheel to display the participants of that competition.
- **Acceptance Criteria:** The spinner wheel visually updates to reflect the selected competition's data.

#### FR-2.2: Spinner Wheel UI & Performance

- **Description:** The visual representation of the spinner and its performance optimization logic.
- **Requirements:**
  1. The spinner will be rendered as a circular wheel divided into segments. Each segment represents one participant and displays their full name and ticket number.
  2. **Dynamic Rendering:** For competitions with \>100 participants, the wheel will only render a subset (e.g., 100\) of segments in the DOM at any given time to maintain performance.
  3. **Optimized Spin Animation:** When the spin is triggered for a large list, the system will calculate the final position of the winner. The animation will then dynamically load and display a "window" of participants around that winner as the wheel slows down, giving a seamless illusion of spinning through the entire list.
- **Acceptance Criteria:** The spinner displays correctly for small lists. For a list of 5,000 participants, the animation remains at a smooth 60fps.

#### FR-2.3: Winner Reveal Workflow

- **Description:** The primary user flow for revealing a winner during a live draw.
- **Requirements:**
  1. The UI will contain a text input field labeled "Enter Winning Ticket Number." This field should only accept numeric input.
  2. A "Spin to Reveal Winner" button will be present. This button shall be disabled until a valid competition is selected and a ticket number is entered.
  3. Clicking the "Spin" button initiates the animation sequence based on the configured physics (FR-1.7).
  4. The wheel must come to a stop with the winning participant's segment perfectly centered or highlighted.
  5. The winner's segment will be visually emphasized (e.g., enlarged, bright border, spotlight effect) for at least 5 seconds after the spin completes.
- **Acceptance Criteria:** Entering a valid ticket number and clicking "Spin" results in the correct winner being revealed in a visually engaging manner.

#### FR-2.4: Previous Winners Display

- **Description:** A running log of winners revealed during the current session.
- **Requirements:**
  1. A dedicated, clearly visible area in the Side Panel will display "Session Winners."
  2. After a winner is revealed, their First Name, Last Name, and Ticket Number are added to this list.
  3. The list persists as long as the browser session is active. It should be designed to accommodate multiple entries (e.g., a scrollable list).
- **Acceptance Criteria:** After performing two successful spins for two different competitions, both winners are visible in the "Session Winners" list.

## **4.0 Non-Functional Requirements**

- **NFR-1: Performance:** The Side Panel UI must load in under 2 seconds. All animations must maintain a consistent 60 frames per second.
- **NFR-2: Usability:** The UI must be intuitive and require no training. The workflow from configuration to live draw must be logical and seamless.
- **NFR-3: Security:** The extension must not make any external network calls. All data must be processed and stored locally.
- **NFR-4: Maintainability:** The codebase must be written in TypeScript, be well-commented, and use a modular component structure. The data layer must be abstracted to facilitate future development.

## **5.0 Out-of-Scope (Future Features)**

The following features are explicitly excluded from the MVP:

- User-configurable branding (logos, banners, colors).
- Manual "grab and throw" interaction with the spinner wheel.
- Backend integration, user accounts, or cloud synchronization.
- Sound effects.
- Multi-language support.
