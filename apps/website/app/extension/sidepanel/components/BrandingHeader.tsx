'use client';

import { Competition } from '@raffle-spinner/storage';

interface BrandingHeaderProps {
  competition?: Competition | null;
  branding?: {
    bannerImage?: string;
    logoImage?: string;
    companyName?: string;
    showCompanyName?: boolean;
    logoPosition?: 'left' | 'center' | 'right';
  };
  hasBranding: boolean;
}

/**
 * BrandingHeader Component
 * Displays company branding with banner and logo
 * Extracted from SidePanel.tsx to reduce file size
 */
export function BrandingHeader({ competition, branding, hasBranding }: BrandingHeaderProps) {
  if (!hasBranding || !branding) return null;

  const bannerImage = competition?.bannerImage || branding.bannerImage;
  const showBanner = Boolean(bannerImage);

  return (
    <div className="w-full h-32 relative overflow-hidden bg-card border-b border-border">
      {showBanner && (
        <img
          src={bannerImage}
          alt={competition?.bannerImage ? `${competition.name} Banner` : 'Company Banner'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {(branding.logoImage || branding.companyName) && (
        <div
          className={`absolute inset-0 flex items-center px-6 ${
            branding.logoPosition === 'left'
              ? 'justify-start'
              : branding.logoPosition === 'right'
                ? 'justify-end'
                : 'justify-center'
          }`}
        >
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
      )}

      {!showBanner && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
      )}
    </div>
  );
}