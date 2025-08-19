# Quick Start Guide: Iframe Architecture Implementation

## Immediate Actions for Development Team

### Day 1 Tasks - Website Routes Setup

#### 1. Create Extension Layout (Emily)
```bash
# Create extension-specific layout without navigation
mkdir -p apps/website/app/extension
```

Create `apps/website/app/extension/layout.tsx`:
```typescript
export default function ExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
```

#### 2. Create Sidepanel Route (Emily)
```bash
mkdir -p apps/website/app/extension/sidepanel
```

Create `apps/website/app/extension/sidepanel/page.tsx`:
```typescript
'use client';

import { Suspense } from 'react';

export default function ExtensionSidePanel() {
  return (
    <Suspense fallback={<div>Loading spinner...</div>}>
      <div className="h-screen w-full bg-background">
        <h1>Spinner Panel - Coming Soon</h1>
        {/* SlotMachine components will go here */}
      </div>
    </Suspense>
  );
}
```

#### 3. Create Options Route (Emily)
```bash
mkdir -p apps/website/app/extension/options
```

Create `apps/website/app/extension/options/page.tsx`:
```typescript
'use client';

export default function ExtensionOptions() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Extension Settings</h1>
      {/* Competition management components will go here */}
    </div>
  );
}
```

#### 4. Configure Middleware for CORS (Robert)
Create `apps/website/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Allow iframe embedding for extension routes
  if (request.nextUrl.pathname.startsWith('/extension')) {
    // Remove X-Frame-Options to allow embedding
    response.headers.delete('X-Frame-Options');
    
    // Set permissive CSP for extension context
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'self' chrome-extension://* moz-extension://* http://localhost:*"
    );
    
    // Add CORS headers for extension requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  
  return response;
}

export const config = {
  matcher: '/extension/:path*',
};
```

### Day 2 Tasks - Extension HTML Setup

#### 1. Update Extension Files (Michael)

Create `apps/spinner-extension/public/sidepanel-iframe.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DrawDay Spinner</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="loading" class="loading">Loading...</div>
  <iframe 
    id="content-frame" 
    style="display: none;"
    allow="clipboard-write; clipboard-read"
  ></iframe>
  <script>
    (function() {
      const isDev = localStorage.getItem('devMode') === 'true';
      const baseUrl = isDev ? 'http://localhost:3000' : 'https://www.drawday.app';
      
      const iframe = document.getElementById('content-frame');
      const loading = document.getElementById('loading');
      
      iframe.src = `${baseUrl}/extension/sidepanel`;
      
      iframe.onload = function() {
        loading.style.display = 'none';
        iframe.style.display = 'block';
      };
      
      iframe.onerror = function() {
        loading.innerHTML = 'Failed to load. Please check your connection.';
      };
    })();
  </script>
</body>
</html>
```

Create `apps/spinner-extension/public/options-iframe.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DrawDay Spinner Settings</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe 
    id="content-frame"
    allow="clipboard-write; clipboard-read"
  ></iframe>
  <script>
    (function() {
      const isDev = localStorage.getItem('devMode') === 'true';
      const baseUrl = isDev ? 'http://localhost:3000' : 'https://www.drawday.app';
      
      const iframe = document.getElementById('content-frame');
      iframe.src = `${baseUrl}/extension/options`;
    })();
  </script>
</body>
</html>
```

#### 2. Update Manifest for Testing
Update `apps/spinner-extension/public/manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "DrawDay Spinner (Iframe Test)",
  "version": "2.0.0-beta",
  "description": "Professional live draw spinner - Iframe Architecture",
  "permissions": ["storage"],
  "side_panel": {
    "default_path": "sidepanel-iframe.html"
  },
  "options_page": "options-iframe.html",
  "action": {
    "default_title": "Open DrawDay Spinner"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; frame-src http://localhost:3000 https://www.drawday.app https://*.drawday.app; object-src 'none'"
  }
}
```

### Day 3 Tasks - Testing Setup

#### 1. Local Development Testing (All Team Members)

**Step 1: Start Website Dev Server**
```bash
cd apps/website
pnpm dev
# Should run on http://localhost:3000
```

**Step 2: Test Extension Routes Directly**
```bash
# Open in browser to verify routes work
open http://localhost:3000/extension/sidepanel
open http://localhost:3000/extension/options
```

**Step 3: Load Extension in Chrome**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `apps/spinner-extension/public` directory
5. Click on the extension icon and test the side panel

**Step 4: Enable Dev Mode in Extension**
```javascript
// In browser console while on extension page
localStorage.setItem('devMode', 'true');
```

#### 2. Create Test Components (Emily)

Create a simple test component to verify iframe loading:

`apps/website/components/extension/TestConnection.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';

export function TestConnection() {
  const [isInIframe, setIsInIframe] = useState(false);
  const [parentOrigin, setParentOrigin] = useState('');
  
  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);
    
    // Get parent origin if in iframe
    if (inIframe && window.location.ancestorOrigins) {
      setParentOrigin(window.location.ancestorOrigins[0] || 'unknown');
    }
  }, []);
  
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Connection Test</h2>
      <p>In Iframe: {isInIframe ? 'Yes' : 'No'}</p>
      {isInIframe && <p>Parent Origin: {parentOrigin}</p>}
      <p>Current Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
```

Use in the extension pages:
```typescript
// In apps/website/app/extension/sidepanel/page.tsx
import { TestConnection } from '@/components/extension/TestConnection';

export default function ExtensionSidePanel() {
  return (
    <div className="h-screen w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Spinner Panel</h1>
      <TestConnection />
    </div>
  );
}
```

### Testing Checklist

#### Basic Functionality
- [ ] Website routes load correctly at `/extension/sidepanel` and `/extension/options`
- [ ] Extension loads the iframe HTML files
- [ ] Iframes successfully load website content
- [ ] No CORS or CSP errors in console
- [ ] Dev mode toggle works (localhost vs production URL)

#### Visual Checks
- [ ] Content fills the entire sidepanel/options area
- [ ] No scrollbars or layout issues
- [ ] Styles load correctly
- [ ] Responsive to panel resizing

#### Development Experience
- [ ] Hot reload works when editing website components
- [ ] Changes appear in extension without reinstalling
- [ ] Browser DevTools work for debugging
- [ ] Console logs appear correctly

### Common Issues and Solutions

#### Issue: CORS Errors
**Solution**: Check middleware configuration and ensure CSP headers are correct

#### Issue: Iframe Won't Load
**Solution**: 
1. Check if website dev server is running
2. Verify localStorage devMode setting
3. Check browser console for errors

#### Issue: Styles Not Loading
**Solution**: Ensure Tailwind CSS is configured for extension routes

#### Issue: Authentication Not Working
**Solution**: Will be addressed in Phase 2 - for now, skip auth in extension context

### Next Steps After Basic Setup Works

1. **Move First Component** (Day 4)
   - Start with a simple component like BrandingHeader
   - Test data persistence with localStorage

2. **Set Up Storage Abstraction** (Day 5)
   - Create the storage package
   - Implement localStorage adapter
   - Test with one context

3. **Migrate Competition Context** (Day 6)
   - Most critical for functionality
   - Update to use storage abstraction
   - Test CRUD operations

## Communication Channels

- **Daily Standup**: 9 AM - Quick sync on progress
- **Slack Channel**: #iframe-migration
- **Issues**: Tag with `iframe-architecture`
- **Questions**: Ask David (Architecture) or Emily (Frontend)

## Success Criteria for Week 1

### Must Have
- [ ] Extension loads website routes via iframe
- [ ] No security/CORS errors
- [ ] Basic component renders in both sidepanel and options
- [ ] Development workflow established

### Nice to Have
- [ ] One full component migrated
- [ ] Storage abstraction implemented
- [ ] Hot reload working perfectly

### Blockers to Report Immediately
- Security policy violations
- Performance issues (>3 second load time)
- Build or deployment problems
- Missing dependencies or tools

## Resources

- [Chrome Extension Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Iframe Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [CORS Configuration Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)