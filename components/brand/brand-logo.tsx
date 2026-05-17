'use client';

import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { DEFAULT_APP_LOGO_URL, DEFAULT_APP_NAME } from '@/lib/branding/constants';
import { cn } from '@/lib/utils';

export interface BrandLogoProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> {
  logoUrl?: string | null;
  name?: string | null;
  decorative?: boolean;
}

export function BrandLogo({
  logoUrl,
  name,
  decorative = true,
  className,
  ...props
}: BrandLogoProps) {
  const resolvedSrc = logoUrl?.trim() || DEFAULT_APP_LOGO_URL;
  const [src, setSrc] = useState(resolvedSrc);
  const brandName = name?.trim() || DEFAULT_APP_NAME;

  useEffect(() => {
    setSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    // Dynamic branding can be local, S3, or another hosted URL, so next/image is too restrictive here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={src}
      alt={decorative ? '' : `${brandName} logo`}
      className={cn('object-contain', className)}
      onError={() => setSrc(DEFAULT_APP_LOGO_URL)}
    />
  );
}
