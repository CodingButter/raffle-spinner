/**
 * Image Upload Component
 *
 * Purpose: Reusable component for image uploads with drag-and-drop support,
 * preview, and file validation.
 */

import { useRef, useState, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

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
      <div
        className={cn(
          'relative group border-2 border-transparent hover:border-dashed hover:border-primary/50 rounded overflow-hidden transition-all',
          isDragging && 'border-primary bg-primary/10',
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

        <img src={value} alt="Uploaded image" className="w-full h-full object-cover" />

        {/* Overlay on hover/drag */}
        <div
          className={cn(
            'absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2',
            isDragging && 'opacity-100'
          )}
        >
          {isDragging ? (
            <div className="text-white text-center">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Drop to replace</p>
            </div>
          ) : (
            <>
              <Button
                size="icon"
                variant="secondary"
                className={compact ? 'h-8 w-8' : 'h-10 w-10'}
                onClick={() => fileInputRef.current?.click()}
                type="button"
                title="Replace image"
              >
                <Upload className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className={compact ? 'h-8 w-8' : 'h-10 w-10'}
                onClick={handleRemove}
                type="button"
                title="Remove image"
              >
                <Trash2 className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </Button>
            </>
          )}
        </div>
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
        {placeholder ||
          (compact ? (
            // Compact mode - just icon, no text
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="h-6 w-6" />
              {isDragging && <p className="text-xs mt-1">Drop</p>}
            </div>
          ) : (
            // Normal mode - icon with text
            <>
              <ImageIcon className="h-8 w-8 mb-2" />
              <p className="text-sm">
                {isDragging ? 'Drop image here' : 'Drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          ))}
      </button>
    </div>
  );
}
