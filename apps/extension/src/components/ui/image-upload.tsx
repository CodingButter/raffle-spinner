/**
 * Image Upload Component
 *
 * Purpose: Reusable component for image uploads with drag-and-drop support,
 * preview, and file validation.
 */

import { useRef, useState, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string; // Base64 encoded image
  onChange: (value: string | undefined) => void;
  onError?: (error: string) => void;
  maxSize?: number; // In bytes
  accept?: string;
  className?: string;
  height?: string;
  width?: string;
  placeholder?: React.ReactNode;
  compact?: boolean; // For smaller UI in lists
}

export function ImageUpload({
  value,
  onChange,
  onError,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = 'image/*',
  className,
  height = 'h-32',
  width = 'w-full',
  placeholder,
  compact = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      onError?.(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Only image files are allowed');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.onerror = () => {
      onError?.('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if we're leaving the component entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      onError?.('Please drop an image file');
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <img
          src={value}
          alt="Uploaded image"
          className={cn('object-cover rounded border', width, height)}
        />
        <Button
          size="icon"
          variant="destructive"
          className={cn(
            'absolute opacity-0 group-hover:opacity-100 transition-opacity',
            compact ? 'top-1 right-1 h-6 w-6' : 'top-2 right-2'
          )}
          onClick={handleRemove}
          type="button"
        >
          <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded transition-all',
        isDragging ? 'border-primary bg-primary/10' : 'border-border',
        width,
        height,
        className
      )}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {placeholder || (
          <>
            <ImageIcon className={compact ? 'h-6 w-6 mb-1' : 'h-8 w-8 mb-2'} />
            <p className={compact ? 'text-xs' : 'text-sm'}>
              {isDragging ? 'Drop image here' : 'Drop or click to upload'}
            </p>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            )}
          </>
        )}
      </button>
    </div>
  );
}
