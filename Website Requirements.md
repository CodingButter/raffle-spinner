# Raffle Spinner Marketing Website Development Specification

## 1. Introduction

### Project Overview

We are developing a marketing website for the Raffle Winner Spinner, a professional Chrome Extension designed for fair and transparent raffle winner selection. The extension uses CSV data to manage participant entries and features an interactive slot machine-style spinning wheel for selecting winners, making it ideal for live draws in competitions.

The core utility of the Raffle Winner Spinner lies in its ability to handle large-scale raffles (up to 5,000+ participants) with high performance, realistic physics-based animations at 60fps, and complete privacy (all data stored locally in the browser with no external connections). Key features include:

- **CSV Import and Smart Mapping**: Intelligent column detection for headers like names, ticket numbers, and emails, with saved mappings, automatic splitting of single "Name" columns, validation for duplicates/errors, and handling of various delimiters.
- **Competition Management**: Create and manage multiple raffles with custom branding, track winners with session history, and export results.
- **Interactive Slot Machine-Style Wheel**: A visually engaging vertical spinner with 3D perspective, gradient effects, smooth scrolling animations, subset swapping for performance, and customizable physics (e.g., spin duration, deceleration curves).
- **Privacy and Security**: No data leaves the user's device, ensuring compliance and trust for professional use. No external API calls or tracking.
- **Theming and Branding**: Full customization with color themes, logos, banners, fonts, and live previews.
- **Help System**: Contextual tooltips, modals, and comprehensive documentation for easy onboarding.

The extension targets organizers in the UK competition industry, where live draws are common for raffling high-value prizes like cars, bikes, and trucks. Our goal is to position the Raffle Winner Spinner as an essential tool that enhances transparency, engagement, and professionalism in these events.

This document outlines the requirements for a new marketing website to showcase the extension's utility, drive downloads/installations, and attract potential users (e.g., competition companies). The site should be visually compelling, user-friendly, and optimized for conversions (e.g., Chrome Web Store installs or sign-ups). The specification has been updated to reflect the production-ready features from the Software Requirements Specification (SRS) v4.0, including enhanced UI, performance optimizations, and additional capabilities.

### Target Audience

- **Primary**: UK-based competition organizers, raffle companies, and event hosts who run live draws for prizes like luxury cars, performance bikes, trucks, vans, cash, tech, and holidays.
- **Secondary**: Charities, event planners, or businesses running promotional raffles.
- **User Journey**: Visitors should quickly understand the tool's value, see it in action via demos, and be guided to install it from the Chrome Web Store.

## 2. Background: UK Competition Industry

The UK competition industry is a thriving sector focused on online raffles and prize draws, often featuring high-value items like luxury cars (e.g., supercars, classics), bikes, trucks, vans, and other vehicles. Popular platforms include Rev Comps, Dream Car Giveaways, BOTB, Elite Competitions, R Kings Competitions, Lucky Day Competitions, Prestige Prizes, LLF Games, Retroshite, Nitrous Competitions, and McKinney Competitions. These sites have given away over £75M in prizes, with tens of thousands of winners annually.

### Key Industry Characteristics

- **Prizes and Scale**: Competitions raffle everything from performance cars (e.g., VW Golf R, Ford Ranger Raptor) and bikes to trucks (e.g., Dodge Ram TRX) and cash alternatives (e.g., £250,000). Tickets start as low as 50p–99p, with fixed odds and guaranteed draws.
- **Business Model**: Revenue from ticket sales; if entries don't sell out, winners may receive 50–75% of sales or guaranteed prizes. Many are family-run or app-based, with over 3 million users across platforms.
- **Live Draws**: A core feature for transparency. Draws are broadcast live on social media (e.g., Facebook, YouTube, TikTok) or websites, using random number generators. Winners are selected in real-time, called immediately, and prizes delivered (e.g., cars loaded and shipped). This builds trust, as audiences watch the process unfold.
- **Regulations**: Governed by the Gambling Commission. Raffles require licenses if purely chance-based; some operate as "prize competitions" with skill elements to bypass full lottery rules. Online platforms must comply with rules for fundraising, lotteries, and social media promotions, including live streaming requirements.
- **Challenges and Opportunities**: Organizers need tools for fair, engaging selections to maintain credibility. Issues like scams or low engagement highlight the need for transparent, high-performance solutions like our slot machine-style spinner, which can replace basic random generators with an interactive wheel for more exciting live streams, complete with subset swapping for seamless large-scale performance.
- **Market Trends**: Growing popularity with 1,000s of monthly winners; integration with apps and social media; focus on user testimonials and video evidence of wins.

The website must emphasize how the Raffle Winner Spinner addresses these needs: enhancing live draw excitement, ensuring fairness, and scaling for large entries—positioning it as a must-have for industry leaders.

## 3. Website Goals

- **Showcase Utility**: Demonstrate the spinner's awesomeness through interactive demos, videos, and real-world examples tied to UK competitions (e.g., "Spin to win a luxury car in your next live draw!").
- **Drive Engagement**: Encourage visitors to try a demo, install the extension, or contact us for custom integrations.
- **Build Credibility**: Highlight privacy, performance (e.g., 60fps animations, subset swapping), and transparency to appeal to regulated industry users.
- **SEO and Marketing**: Optimize for searches like "raffle spinner for live draws," "UK competition winner selector," "fair raffle tool for cars and bikes," and "slot machine raffle extension."
- **Conversion Metrics**: Aim for high install rates, email sign-ups, and inquiries from competition companies.

## 4. Site Structure and Features

The site should be a single-page application (SPA) or multi-page with smooth navigation, using a modern framework like React or Next.js for interactivity. Include high-quality visuals (e.g., animations mimicking the slot machine wheel).

### Key Sections

1. **Hero Section (Home Page Top)**
   - Eye-catching headline: "Revolutionize Your Live Draws with the Ultimate Raffle Winner Spinner – Fair, Fun, and Transparent!"
   - Subheadline: "Perfect for UK competitions raffling cars, bikes, trucks, and more. Handle 5,000+ entries with realistic slot machine spins and custom branding."
   - Call-to-Action (CTA): "Install Now" (links to Chrome Web Store) and "Watch Demo" (embedded video).
   - Background: Animated slot machine graphic or video loop of a live draw simulation.

2. **About the Spinner**
   - Explain what it is: A Chrome Extension for winner selection with dual interfaces (admin options page and clean side panel for audiences).
   - Tie to industry: "Designed for UK raffle sites like Rev Comps or Dream Car Giveaways to make live draws more engaging."
   - Bullet points on key benefits: Fairness, scalability, privacy, performance optimizations, and full theming.

3. **Features Showcase**
   - Grid or carousel of features with icons, descriptions, and GIFs/screenshots:
     - Intelligent CSV Import & Saved Mapping with data validation and duplicate handling.
     - Slot Machine-Style Wheel Animation with subset swapping and physics customization.
     - Multi-Competition Management with search, filters, and custom branding overrides.
     - Winner History, Session Management & Export.
     - High Performance for Live Events (60fps, optimized for large lists).
     - Advanced Theming: Colors, fonts, logos, banners, and live previews.
     - Comprehensive Help System with tooltips and modals.
   - Emphasize utility: "Turn boring number draws into thrilling slot machine spins during your Facebook Live sessions."

4. **How It Works**
   - Step-by-step guide with numbered list and visuals:
     1. Upload CSV of entries (e.g., from your car raffle ticket sales) and use smart mapping.
     2. Map columns, validate data, and handle duplicates.
     3. Create a raffle (e.g., "Win a Ford F150 Truck") with custom theme/branding.
     4. Spin the wheel live – watch the physics-based slot machine animation select a winner with seamless subset swapping.
     5. Track session history, display winner with confetti, and export results.
   - Include an interactive demo: Embed a web-based simulation of the slot machine spinner (non-functional version for marketing; full functionality in extension).

5. **Industry Integration & Use Cases**
   - Section on UK competitions: "Elevate Your Car, Bike, and Truck Raffles."
   - Examples: Screenshots or mockups of using the spinner in a live draw for a luxury car prize, with branded themes.
   - Testimonials placeholder: Space for user quotes (e.g., "Transformed our live draws! – Rev Comps User").
   - Case Studies: Hypothetical or real stories of using it for high-stakes raffles, highlighting performance for 5,000+ entries.

6. **Demo/Video Gallery**
   - Embedded YouTube videos: Tutorial, live draw simulation, comparison to basic tools.
   - Interactive Demo: A web-embedded spinner where users can upload a sample CSV and spin (use JavaScript to mimic; link to full extension).

7. **Pricing & Download**
   - If free/open-source: "Free to Install – Premium Features Coming Soon."
   - CTA: Direct link to Chrome Web Store.
   - Contact form for enterprise inquiries (e.g., custom branding for competition sites).

8. **Blog/Resources**
   - Articles on UK raffle tips, live draw best practices, and how the spinner complies with Gambling Commission rules.

9. **Footer**
   - Links: Privacy Policy, Terms, Contact, GitHub Repo.
   - Social Proof: Badges for Chrome Store ratings, industry mentions.

### Additional Features

- **Interactive Elements**: Slot machine animations on hover/scroll for engagement.
- **Forms**: Newsletter sign-up, demo request.
- **Analytics**: Integrate Google Analytics for tracking.
- **SEO**: Meta tags, alt text, schema markup for "raffle tool."

## 5. Design Guidelines

- **Theme**: Modern, energetic, with a "slot machine" motif. Colors: Vibrant blues/greens (trust/transparency), accents of red/orange (excitement).
- **Typography**: Clean sans-serif (e.g., Inter or Roboto) for readability.
- **Visuals**: High-res images of cars, bikes, trucks in raffle contexts; custom illustrations of the slot machine spinner.
- **Responsiveness**: Mobile-first; ensure demos work on all devices.
- **Accessibility**: WCAG compliant (alt text, keyboard nav).
- **Performance**: Optimize for fast load (<2s); use lazy loading for media.
- **Branding**: Logo from GitHub repo; consistent with extension's UI (e.g., Tailwind CSS themes).

## 6. Technical Requirements

- **Stack**: Frontend: HTML/CSS/JS or React/Next.js. Backend: Static site (e.g., via Vercel/Netlify) unless forms need server (use Formspree or similar).
- **Integrations**:
  - Chrome Web Store link.
  - Video embeds (YouTube/Vimeo).
  - Analytics (Google/GA4).
  - Email (Mailchimp for sign-ups).
- **Security**: HTTPS, no user data collection beyond forms.
- **Testing**: Cross-browser (focus on Chrome), device testing.
- **Deployment**: CI/CD pipeline; domain: Suggest rafflespinner.com or similar.
- **Timeline & Milestones**:
  - Week 1: Wireframes & Design Mockups.
  - Week 2-3: Development & Testing.
  - Week 4: Launch & Iterations.
- **Budget Considerations**: Focus on core features; phase 2 for advanced demo.

## 7. Next Steps

- Review this updated spec (incorporating SRS v4.0 features) and provide feedback/estimates.
- Schedule kickoff call to discuss wireframes.
- Share any questions on industry tie-ins or features.

This website will position the Raffle Winner Spinner as the go-to tool for UK competition live draws, highlighting its utility in making raffles more transparent and exciting. Let's build something awesome!

**Document History:**

- Original: Based on initial pasted content.
- Updated: August 11, 2025 – Integrated production features from SRS v4.0 (e.g., slot machine spinner, theming, performance enhancements).
