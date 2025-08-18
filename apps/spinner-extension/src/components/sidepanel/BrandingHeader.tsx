/**
 * BrandingHeader Component
 * 
 * Purpose: Displays branding banner, logo, and company name for Pro users
 * Extracted from SidePanelWithPersistence.tsx to maintain file size limits
 * 
 * Architecture Decision:
 * - Isolated branding logic for better testability
 * - Single responsibility: brand presentation
 * - Reusable across different views
 */

import type { Competition } from '@raffle-spinner/storage';

interface BrandingHeaderProps {
  competition?: Competition | null;
  branding?: {
    logoImage?: string;
    bannerImage?: string;
    companyName?: string;
    showCompanyName?: boolean;
    logoPosition?: 'left' | 'center' | 'right';
  };
  hasBranding: boolean;
}

// Helper to get logo position class
function getLogoPositionClass(position?: 'left' | 'center' | 'right'): string {
  if (position === 'left') return 'justify-start';
  if (position === 'right') return 'justify-end';
  return 'justify-center';
}

// Banner image component
function BannerImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

// Logo overlay component
function LogoOverlay({ 
  branding, 
  logoPositionClass 
}: { 
  branding: BrandingHeaderProps['branding']; 
  logoPositionClass: string;
}) {
  if (!branding) return null;
  
  return (
    <div className={`absolute inset-0 flex items-center px-6 ${logoPositionClass}`}>
      <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
        {branding.logoImage && (
          <img 
            src={branding.logoImage} 
            alt="Company Logo" 
            className="h-16 w-auto object-contain drop-shadow-lg"
          />
        )}
        {branding.showCompanyName && branding.companyName && (
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {branding.companyName}
          </h1>
        )}
      </div>
    </div>
  );
}

export function BrandingHeader({ 
  competition, 
  branding, 
  hasBranding 
}: BrandingHeaderProps) {
  if (!hasBranding || !branding) {
    return null;
  }

  const bannerImage = competition?.bannerImage || branding.bannerImage;
  const hasLogo = branding.logoImage || branding.companyName;
  const logoPositionClass = getLogoPositionClass(branding.logoPosition);

  return (
    <div className="w-full h-32 relative overflow-hidden bg-card border-b border-border">
      {bannerImage ? (
        <BannerImage 
          src={bannerImage} 
          alt={competition?.bannerImage ? `${competition.name} Banner` : "Company Banner"} 
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
      )}
      
      {hasLogo && (
        <LogoOverlay branding={branding} logoPositionClass={logoPositionClass} />
      )}
    </div>
  );
}