# Website Architecture & Implementation Guide

## Document Version

- **Version:** 1.0
- **Date:** December 2024
- **Status:** Production Implementation

## Overview

This document provides a comprehensive guide to the Raffle Spinner marketing website architecture, code organization, and implementation details. It serves as the primary reference for understanding the Next.js codebase structure and maintaining coding standards.

## Architecture Overview

### Next.js App Router Architecture

```
┌─────────────────────────────────────────┐
│         Server Components               │
│    Data Fetching + Static Generation    │
│         SEO Optimization                │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         Client Components               │
│     Interactive UI + Animations         │
│         State Management                │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│        Shared Components                │
│    UI Library + Tailwind CSS v4         │
│         Monorepo Packages               │
└─────────────────────────────────────────┘
```

## Directory Structure

```
apps/website/
├── app/                       # Next.js App Router
│   ├── page.tsx              # Home page (server component)
│   ├── demo/
│   │   └── page.tsx          # Interactive demo page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── HomePage.tsx          # Main client component
│   ├── DemoCarousel.tsx      # Auto-playing media carousel
│   └── DemoPage.tsx          # Interactive spinner demo
├── lib/
│   ├── get-demo-assets.ts    # Server-side asset scanner
│   └── utils.ts              # Utility functions
├── public/
│   └── assets/
│       └── see-it-in-action/ # Demo media files
└── next.config.mjs           # Next.js configuration
```

## Component Documentation Standards

### File Header Template

Every component file must include:

```typescript
/**
 * [Component Name]
 *
 * Purpose: [Brief description of component functionality]
 *
 * Website Requirements Reference:
 * - [Section from Website Requirements.md]
 *
 * @module [module-name]
 */
```

### Example Implementation

```typescript
/**
 * Demo Carousel Component
 *
 * Purpose: Auto-playing carousel for showcasing demo videos and images
 * of the extension in action.
 *
 * Website Requirements Reference:
 * - Section 4.6: Demo/Video Gallery
 * - Section 4.1: Hero Section (visual engagement)
 *
 * @module components/demo-carousel
 */
```

## Implementation Details

### 1. Server/Client Component Split

The website uses Next.js App Router with careful separation:

```typescript
// app/page.tsx - Server Component
export default function Home() {
  // Server-side data fetching
  const demoAssets = getDemoAssets(); // Uses fs module

  // Pass to client component
  return <HomePage demoAssets={demoAssets} />;
}

// components/HomePage.tsx - Client Component
'use client';
export default function HomePage({ demoAssets }) {
  // Interactive features
  const [count, setCount] = useState(0);
  // Client-side only code
}
```

### 2. Marketing Page Sections

As per Website Requirements.md Section 4:

#### Hero Section (Section 4.1)

- Eye-catching headline with gradient text
- Trust badges (UK Compliant, Secure, Industry Leading)
- Primary CTAs: Install Extension + Watch Demo
- Social proof with user avatars

#### Features Showcase (Section 4.3)

- Three main pain points addressed:
  1. Build Customer Trust
  2. Create Excitement
  3. Save Hours Weekly
- Icon-based feature grid
- Hover effects and animations

#### Demo Section (Section 4.6)

- Auto-playing carousel with videos/images
- Dynamic asset loading from folder
- Thumbnail navigation
- Play/pause controls

#### UK Compliance (Section 4.5)

- Gambling Commission compliance messaging
- Trust indicators
- Gradient background for emphasis

#### Testimonials (Section 4.5)

- Three testimonial cards
- 5-star ratings
- UK company references

### 3. Interactive Demo Page

Located at `/demo`, implements Section 4.6:

```typescript
// Features implemented:
- Live spinner demonstration
- Sample CSV with UK names
- Customizable settings
- Real-time winner selection
- Confetti celebration
```

### 4. Performance Optimizations

#### Static Generation

```typescript
// Pre-render at build time
export default async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}
```

#### Image Optimization

```typescript
import Image from 'next/image';
<Image
  src={asset.src}
  alt={asset.name}
  fill
  priority={index === 0}
  quality={95}
/>
```

#### Dynamic Imports

```typescript
const DemoComponent = dynamic(() => import("@/components/Demo"), {
  ssr: false,
});
```

## Code Organization Principles

### 1. Component Size Limits

Keep components under 200 lines:

```typescript
// ✅ Good - Split into smaller components
HomePage.tsx - Main layout (150 lines)
HeroSection.tsx - Hero content (80 lines)
FeatureGrid.tsx - Features display (100 lines)

// ❌ Bad - Monolithic component
HomePage.tsx - Everything (800+ lines)
```

### 2. Shared Component Library

Leverage monorepo packages:

```typescript
// Import from shared packages
import { Button, Card } from "@raffle-spinner/ui";
import { SlotMachineWheel } from "@raffle-spinner/spinners";
```

### 3. Asset Management

Dynamic asset discovery:

```typescript
// lib/get-demo-assets.ts
export function getDemoAssets(): DemoAsset[] {
  const assetsDir = path.join(process.cwd(), "public/assets/see-it-in-action");
  // Scan directory at build time
  const files = fs.readdirSync(assetsDir);
  // Return typed asset array
}
```

## SEO & Marketing Implementation

### Meta Tags

```typescript
export const metadata: Metadata = {
  title: "Raffle Spinner - Professional UK Competition Tool",
  description: "Fair, transparent raffle draws for UK competitions",
  keywords: ["raffle", "UK competitions", "prize draws", "live draws"],
};
```

### Structured Data

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Raffle Winner Spinner",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Chrome",
};
```

## Styling Architecture

### Tailwind CSS v4 Configuration

```css
/* Using CSS-based config */
@theme {
  --color-brand-gold: #ffd700;
  --color-brand-blue: #4f46e5;
  --color-brand-pink: #ec4899;
}
```

### Component Styling Pattern

```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // Allow override
)} />
```

## State Management

### Local State for UI

```typescript
// Simple useState for UI state
const [isPlaying, setIsPlaying] = useState(true);
const [currentIndex, setCurrentIndex] = useState(0);
```

### No External State Management

The marketing site intentionally avoids complex state:

- No Redux/Zustand needed
- Server components for data
- Local state for interactions

## Build & Deployment

### Development

```bash
pnpm --filter @raffle-spinner/website dev
# Runs on http://localhost:3000
```

### Production Build

```bash
pnpm --filter @raffle-spinner/website build
pnpm --filter @raffle-spinner/website start
```

### Vercel Deployment

Configured in `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm --filter @raffle-spinner/website build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

## Performance Metrics

### Target Metrics

- Lighthouse Score: 95+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1

### Optimization Techniques

- Static generation for all pages
- Image optimization with Next.js Image
- Font optimization with next/font
- Code splitting with dynamic imports

## Testing Strategy

### Unit Tests

- Utility functions
- Asset scanning logic
- Component props validation

### Integration Tests

- Demo page functionality
- Carousel interactions
- Form submissions

### E2E Tests

- Full user journey
- Chrome extension install flow
- Demo interaction

## Security Considerations

### Content Security Policy

```typescript
// next.config.mjs
const csp = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-eval'"],
  "style-src": ["'self'", "'unsafe-inline'"],
};
```

### Data Handling

- No user data collection
- No cookies or tracking
- Local demo data only
- No external API calls

## Maintenance Guidelines

### Adding New Content

1. **Demo Assets**: Drop files in `/public/assets/see-it-in-action/`
2. **Testimonials**: Update array in `HomePage.tsx`
3. **Features**: Modify feature grid in components

### Performance Monitoring

- Use Vercel Analytics
- Monitor Core Web Vitals
- Regular Lighthouse audits
- User feedback tracking

### Content Updates

All marketing copy is in `HomePage.tsx`:

- Headlines
- Feature descriptions
- Testimonials
- CTAs

## Common Patterns

### Responsive Design

```typescript
// Mobile-first approach
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

### Animation Patterns

```typescript
// Smooth transitions
<div className="transition-all duration-300 hover:scale-105">
  Animated element
</div>
```

### Loading States

```typescript
// Skeleton loaders for async content
{loading ? (
  <div className="animate-pulse bg-gray-200 h-32" />
) : (
  <ActualContent />
)}
```

## Future Enhancements

### Planned Features

- Blog/Resources section
- Pricing calculator
- Live chat support
- A/B testing framework
- Analytics dashboard

### Technical Improvements

- Edge runtime optimization
- Incremental Static Regeneration
- WebP/AVIF image formats
- PWA capabilities

---

**Related Documents:**

- Website Requirements.md - Marketing requirements
- DEPLOY_VERCEL.md - Deployment guide
- README.md - Project overview
