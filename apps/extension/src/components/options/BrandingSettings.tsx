/**
 * Branding Settings Component
 *
 * Purpose: Allows users to upload and manage company branding including
 * logos, banners, and company name display.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTheme } from '@/contexts/ThemeContext';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ImageUpload } from '@/components/ui/image-upload';
import { Building2, AlertCircle } from 'lucide-react';

export function BrandingSettings() {
  const { theme, updateBranding } = useTheme();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const helpContent = {
    logo: {
      title: 'Company Logo',
      description: 'Upload your company logo to display in the side panel',
      details: {
        content:
          'Your logo will be displayed at the top of the side panel during raffles. For best results, use a transparent PNG file.',
        tips: [
          'Recommended size: 200x100 pixels',
          'Use PNG format for transparency',
          'Keep file size under 5MB',
        ],
      },
    },
    banner: {
      title: 'Default Banner',
      description: 'Upload a banner image to display across the top of the side panel',
      details: {
        content:
          'The banner will be displayed prominently at the top of the raffle interface. This can be overridden by competition-specific banners.',
        tips: [
          'Recommended size: 800x200 pixels',
          'Use high-quality images for best display',
          'Consider your brand colors and theme',
        ],
      },
    },
    companyName: {
      title: 'Company Name',
      description: 'Display your company name alongside the logo',
      details: {
        content:
          'Your company name will appear next to your logo if enabled. This helps with brand recognition during live events.',
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Branding Settings
        </CardTitle>
        <CardDescription>Customize your company branding and visual identity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Logo Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Company Logo</Label>
            <InfoTooltip {...helpContent.logo} iconSize="sm" />
          </div>

          <div className="flex items-center gap-4">
            <ImageUpload
              value={theme.branding.logoImage}
              onChange={(value) => updateBranding({ logoImage: value })}
              onError={setUploadError}
              width="w-32"
              height="h-20"
              className="object-contain p-2"
            />

            <div className="flex-1">
              <Select
                value={theme.branding.logoPosition}
                onValueChange={(value) =>
                  updateBranding({ logoPosition: value as 'left' | 'center' | 'right' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Position: Left</SelectItem>
                  <SelectItem value="center">Position: Center</SelectItem>
                  <SelectItem value="right">Position: Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Banner Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Default Banner</Label>
            <InfoTooltip {...helpContent.banner} iconSize="sm" />
          </div>

          <ImageUpload
            value={theme.branding.bannerImage}
            onChange={(value) => updateBranding({ bannerImage: value })}
            onError={setUploadError}
            height="h-32"
          />
        </div>

        {/* Company Name */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Company Name</Label>
            <InfoTooltip {...helpContent.companyName} iconSize="sm" />
          </div>

          <div className="space-y-3">
            <Input
              value={theme.branding.companyName || ''}
              onChange={(e) => updateBranding({ companyName: e.target.value })}
              placeholder="Enter your company name"
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="show-company-name"
                checked={theme.branding.showCompanyName}
                onCheckedChange={(checked) => updateBranding({ showCompanyName: checked })}
              />
              <Label htmlFor="show-company-name">Display company name with logo</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
