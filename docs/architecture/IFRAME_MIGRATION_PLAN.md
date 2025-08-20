# Iframe Architecture Migration Plan

## Executive Summary
Transform the DrawDay Spinner Chrome Extension from a standalone application to an iframe-based architecture, where the extension serves as a lightweight container loading pages from the website.

## Current State Analysis

### Extension Components to Migrate
- **Contexts** (6 total): Competition, Settings, Theme, Subscription, CollapsibleState
- **SidePanel Components** (10+ components): SlotMachineWheelWrapper, WinnerDisplay, SpinnerControls, etc.
- **Options Components** (20+ components): CompetitionManagement, CSVUploadModal, SpinnerCustomization, etc.
- **Storage Layer**: Chrome.storage.local wrapper
- **Authentication**: Directus-based auth with token management

### Website Existing Infrastructure
- Next.js 14 App Router
- Authentication system with Directus
- Existing dashboard at `/dashboard`
- API routes for Stripe and Directus integration

## Detailed Implementation Steps

### Phase 1: Website Infrastructure (Days 1-3)

#### Day 1: Route Setup
1. **Create Extension Routes**
   ```typescript
   // apps/website/app/extension/layout.tsx
   // Minimal layout without navigation for iframe embedding
   
   // apps/website/app/extension/sidepanel/page.tsx
   // Spinner wheel interface
   
   // apps/website/app/extension/options/page.tsx
   // Configuration interface
   ```

2. **Configure CORS and Security**
   ```typescript
   // apps/website/middleware.ts
   export function middleware(request: NextRequest) {
     const response = NextResponse.next();
     
     // Allow embedding in extension
     if (request.nextUrl.pathname.startsWith('/extension')) {
       response.headers.set('X-Frame-Options', 'SAMEORIGIN');
       response.headers.set(
         'Content-Security-Policy',
         "frame-ancestors chrome-extension://* http://localhost:* https://*.drawday.app"
       );
     }
     
     return response;
   }
   ```

3. **Environment Detection**
   ```typescript
   // apps/website/lib/environment.ts
   export const isExtensionContext = () => {
     return window.location.ancestorOrigins?.[0]?.startsWith('chrome-extension://');
   };
   
   export const getExtensionId = () => {
     const origin = window.location.ancestorOrigins?.[0];
     return origin?.replace('chrome-extension://', '');
   };
   ```

#### Day 2: Storage Abstraction Layer
1. **Create Storage Interface**
   ```typescript
   // packages/@drawday/storage/src/index.ts
   export interface IStorage {
     get<T>(key: string): Promise<T | null>;
     set<T>(key: string, value: T): Promise<void>;
     remove(key: string): Promise<void>;
     clear(): Promise<void>;
     watch<T>(key: string, callback: (value: T) => void): () => void;
   }
   ```

2. **Implement Adapters**
   ```typescript
   // packages/@drawday/storage/src/adapters/localStorage.ts
   export class LocalStorageAdapter implements IStorage {
     private listeners = new Map<string, Set<Function>>();
     
     async get<T>(key: string): Promise<T | null> {
       try {
         const item = localStorage.getItem(key);
         return item ? JSON.parse(item) : null;
       } catch {
         return null;
       }
     }
     
     async set<T>(key: string, value: T): Promise<void> {
       localStorage.setItem(key, JSON.stringify(value));
       this.notifyListeners(key, value);
     }
     
     watch<T>(key: string, callback: (value: T) => void): () => void {
       if (!this.listeners.has(key)) {
         this.listeners.set(key, new Set());
       }
       this.listeners.get(key)!.add(callback);
       
       return () => {
         this.listeners.get(key)?.delete(callback);
       };
     }
     
     private notifyListeners(key: string, value: any) {
       this.listeners.get(key)?.forEach(callback => callback(value));
     }
   }
   ```

#### Day 3: Authentication Integration
1. **Shared Auth Context**
   ```typescript
   // apps/website/contexts/ExtensionAuthContext.tsx
   export const ExtensionAuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     
     useEffect(() => {
       // Check if in extension context
       if (isExtensionContext()) {
         // Use existing website auth
         checkAuthStatus();
       }
     }, []);
     
     return (
       <AuthContext.Provider value={{ user }}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

### Phase 2: Component Migration (Days 4-8)

#### Day 4: Move Core Spinner Components
1. **Create Spinner Package in Website**
   ```bash
   # Move from extension to website
   mkdir -p apps/website/components/extension/spinner
   cp -r apps/spinner-extension/src/components/sidepanel/* \
         apps/website/components/extension/spinner/
   ```

2. **Update Imports**
   - Replace chrome.storage with storage abstraction
   - Update paths for shared components
   - Remove extension-specific APIs

#### Day 5: Move Options Components
1. **Migrate Competition Management**
   ```typescript
   // apps/website/components/extension/options/CompetitionManagement.tsx
   // Update to use localStorage instead of chrome.storage
   ```

2. **Migrate CSV Parser**
   ```typescript
   // apps/website/lib/csv-parser.ts
   // Move CSV parsing logic to website
   ```

#### Day 6: Context Migration
1. **Competition Context**
   ```typescript
   // apps/website/contexts/CompetitionContext.tsx
   import { LocalStorageAdapter } from '@drawday/storage';
   
   const storage = new LocalStorageAdapter();
   
   export const CompetitionProvider = ({ children }) => {
     const [competitions, setCompetitions] = useState([]);
     
     useEffect(() => {
       storage.get('competitions').then(setCompetitions);
     }, []);
     
     const saveCompetition = async (competition) => {
       const updated = [...competitions, competition];
       await storage.set('competitions', updated);
       setCompetitions(updated);
     };
     
     return (
       <CompetitionContext.Provider value={{ competitions, saveCompetition }}>
         {children}
       </CompetitionContext.Provider>
     );
   };
   ```

#### Day 7-8: UI Integration
1. **Create Extension Pages**
   ```typescript
   // apps/website/app/extension/sidepanel/page.tsx
   import { SpinnerArea } from '@/components/extension/spinner/SpinnerArea';
   import { CompetitionProvider } from '@/contexts/CompetitionContext';
   
   export default function ExtensionSidePanel() {
     return (
       <CompetitionProvider>
         <div className="h-screen w-full">
           <SpinnerArea />
         </div>
       </CompetitionProvider>
     );
   }
   ```

### Phase 3: Extension Simplification (Days 9-11)

#### Day 9: Update Extension Structure
1. **Simplify Manifest**
   ```json
   {
     "manifest_version": 3,
     "name": "DrawDay Spinner",
     "version": "2.0.0",
     "permissions": ["storage"],
     "side_panel": {
       "default_path": "sidepanel.html"
     },
     "options_page": "options.html",
     "content_security_policy": {
       "extension_pages": "frame-src http://localhost:3000 https://www.drawday.app"
     }
   }
   ```

2. **Create HTML Wrappers**
   ```html
   <!-- apps/spinner-extension/public/sidepanel.html -->
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <style>
       body { margin: 0; padding: 0; overflow: hidden; }
       iframe { width: 100%; height: 100vh; border: none; }
     </style>
   </head>
   <body>
     <iframe id="content" allow="clipboard-write; clipboard-read"></iframe>
     <script src="iframe-loader.js"></script>
   </body>
   </html>
   ```

#### Day 10: Environment Configuration
1. **Dynamic URL Resolution**
   ```javascript
   // apps/spinner-extension/src/iframe-loader.js
   (async function() {
     const isDev = await chrome.storage.local.get('devMode');
     const baseUrl = isDev.devMode 
       ? 'http://localhost:3000' 
       : 'https://www.drawday.app';
     
     const iframe = document.getElementById('content');
     const page = window.location.pathname.replace('.html', '');
     iframe.src = `${baseUrl}/extension${page}`;
     
     // Handle messages from iframe
     window.addEventListener('message', (event) => {
       if (event.origin !== baseUrl) return;
       
       // Handle extension-specific APIs if needed
       handleMessage(event.data);
     });
   })();
   ```

#### Day 11: Message Bridge (if needed)
1. **Extension API Bridge**
   ```typescript
   // apps/spinner-extension/src/bridge.ts
   const handlers = {
     openTab: (url: string) => chrome.tabs.create({ url }),
     getVersion: () => chrome.runtime.getManifest().version,
     // Add other extension-specific APIs as needed
   };
   
   window.addEventListener('message', async (event) => {
     const { type, payload, id } = event.data;
     
     if (handlers[type]) {
       try {
         const result = await handlers[type](payload);
         event.source.postMessage({ id, result }, event.origin);
       } catch (error) {
         event.source.postMessage({ id, error: error.message }, event.origin);
       }
     }
   });
   ```

### Phase 4: Data Migration (Days 12-13)

#### Day 12: Migration Utilities
1. **Data Export from Chrome Storage**
   ```typescript
   // apps/website/lib/migration/export.ts
   export async function exportFromChromeStorage() {
     const data = await chrome.storage.local.get(null);
     return {
       version: '1.0',
       timestamp: Date.now(),
       data
     };
   }
   ```

2. **Data Import to LocalStorage**
   ```typescript
   // apps/website/lib/migration/import.ts
   export async function importToLocalStorage(exportedData) {
     const { data } = exportedData;
     
     for (const [key, value] of Object.entries(data)) {
       localStorage.setItem(key, JSON.stringify(value));
     }
     
     localStorage.setItem('migration_completed', Date.now().toString());
   }
   ```

#### Day 13: Auto-Migration
1. **Migration Check on Load**
   ```typescript
   // apps/website/app/extension/migration.tsx
   export function MigrationCheck({ children }) {
     const [migrated, setMigrated] = useState(false);
     
     useEffect(() => {
       const checkMigration = async () => {
         if (localStorage.getItem('migration_completed')) {
           setMigrated(true);
           return;
         }
         
         // Check if we can access chrome.storage
         if (window.chrome?.storage?.local) {
           const data = await chrome.storage.local.get(null);
           if (Object.keys(data).length > 0) {
             await migrateData(data);
           }
         }
         
         setMigrated(true);
       };
       
       checkMigration();
     }, []);
     
     if (!migrated) {
       return <div>Migrating your data...</div>;
     }
     
     return children;
   }
   ```

### Phase 5: Testing & Optimization (Days 14-18)

#### Day 14-15: Testing Suite
1. **E2E Tests for Iframe**
   ```typescript
   // apps/website/tests/extension-iframe.test.ts
   test('iframe loads correctly', async ({ page }) => {
     await page.goto('/extension/sidepanel');
     await expect(page.locator('.spinner-container')).toBeVisible();
   });
   
   test('data persists in localStorage', async ({ page }) => {
     await page.goto('/extension/options');
     await page.fill('#competition-name', 'Test Competition');
     await page.click('#save-button');
     
     await page.reload();
     await expect(page.locator('#competition-name')).toHaveValue('Test Competition');
   });
   ```

#### Day 16: Performance Optimization
1. **Lazy Loading**
   ```typescript
   // apps/website/app/extension/sidepanel/page.tsx
   import dynamic from 'next/dynamic';
   
   const SpinnerArea = dynamic(
     () => import('@/components/extension/spinner/SpinnerArea'),
     { 
       loading: () => <SpinnerSkeleton />,
       ssr: false 
     }
   );
   ```

2. **Bundle Optimization**
   ```javascript
   // apps/website/next.config.js
   module.exports = {
     experimental: {
       optimizeCss: true,
     },
     compress: true,
     images: {
       domains: ['drawday.app'],
     },
   };
   ```

#### Day 17: Security Audit
1. **CSP Validation**
2. **Iframe Sandboxing Review**
3. **Data Validation**
4. **Authentication Flow Security**

#### Day 18: User Acceptance Testing
1. **Internal Testing**
2. **Beta User Group**
3. **Performance Metrics Collection**
4. **Feedback Integration**

## Rollout Strategy

### Stage 1: Development (Week 1-2)
- Complete Phase 1-3
- Internal testing with development team
- Fix critical issues

### Stage 2: Beta (Week 3)
- Deploy to staging environment
- Select beta users (5-10)
- Collect feedback and metrics
- Iterate based on feedback

### Stage 3: Gradual Rollout (Week 4)
- 10% of users → 25% → 50% → 100%
- Monitor error rates and performance
- Ready rollback if needed

### Stage 4: Full Migration (Week 5)
- All users on new architecture
- Deprecate old extension code
- Clean up legacy code

## Success Criteria

### Technical Metrics
- [ ] Page load time < 2 seconds
- [ ] 60fps animation performance maintained
- [ ] Zero data loss during migration
- [ ] 99.9% uptime for extension functionality

### Developer Experience
- [ ] 50% reduction in development time for new features
- [ ] Hot reload working for all extension pages
- [ ] Full debugging capabilities in browser DevTools
- [ ] Test coverage > 80%

### User Experience
- [ ] No visible functionality changes for end users
- [ ] Smooth migration without manual intervention
- [ ] Performance equal or better than current extension
- [ ] All existing features working correctly

## Risk Mitigation

### Risk: Network Connectivity Issues
**Mitigation**: 
- Implement offline fallback with cached content
- Show clear error messages when offline
- Queue actions to sync when online

### Risk: CORS/CSP Configuration Problems
**Mitigation**:
- Thoroughly test in different environments
- Have fallback CSP rules
- Monitor browser console for violations

### Risk: Data Migration Failures
**Mitigation**:
- Create backup before migration
- Implement rollback mechanism
- Provide manual migration option

### Risk: Performance Degradation
**Mitigation**:
- Implement aggressive caching
- Use CDN for static assets
- Monitor Core Web Vitals

## Team Assignments

### David Miller (Lead Developer Architect)
- Architecture design and review
- Security implementation
- Performance optimization strategy

### Emily Davis (Frontend Expert)
- Component migration
- UI/UX consistency
- React optimization

### Michael Thompson (Performance Engineer)
- Performance testing and optimization
- Animation performance maintenance
- Bundle size optimization

### Robert Wilson (Integration Specialist)
- API integration updates
- Authentication flow
- Data migration tools

### Sarah Johnson (Project Manager)
- Timeline management
- Resource allocation
- Stakeholder communication

## Timeline Summary

| Week | Phase | Deliverables |
|------|-------|-------------|
| 1 | Website Infrastructure | Routes, storage, auth |
| 2 | Component Migration | All components moved |
| 3 | Extension Simplification | Iframe wrappers ready |
| 4 | Testing & Optimization | All tests passing |
| 5 | Rollout | Full production deployment |

## Next Steps

1. **Immediate Actions**
   - Review and approve architecture plan
   - Set up development environment
   - Create feature branch for migration

2. **Week 1 Goals**
   - Complete website infrastructure
   - Begin component migration
   - Set up testing framework

3. **Communication**
   - Daily standups during migration
   - Weekly progress reports to stakeholders
   - Beta user recruitment

## Appendix

### File Structure After Migration

```
apps/website/
├── app/
│   ├── extension/
│   │   ├── layout.tsx
│   │   ├── sidepanel/
│   │   │   └── page.tsx
│   │   └── options/
│   │       └── page.tsx
│   ├── components/
│   │   └── extension/
│   │       ├── spinner/
│   │       └── options/
│   └── contexts/
│       └── extension/
│
apps/spinner-extension/
├── public/
│   ├── manifest.json
│   ├── sidepanel.html
│   ├── options.html
│   └── iframe-loader.js
└── src/
    └── bridge.ts

packages/@drawday/
└── storage/
    ├── src/
    │   ├── index.ts
    │   └── adapters/
    │       ├── localStorage.ts
    │       └── chromeStorage.ts
    └── package.json
```

### Configuration Files

#### Extension Environment Config
```javascript
// apps/spinner-extension/.env
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCTION_URL=https://www.drawday.app
```

#### Website Extension Routes Config
```typescript
// apps/website/config/extension.ts
export const extensionConfig = {
  allowedOrigins: [
    'chrome-extension://*',
    'http://localhost:*'
  ],
  routes: {
    sidepanel: '/extension/sidepanel',
    options: '/extension/options'
  }
};
```