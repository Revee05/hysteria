"use client";

import React, { useState } from 'react';
import Image from 'next/image';

/**
 * Card Component - Komponen kartu yang dinamis dan dapat disesuaikan
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Konten utama card
 * @param {string} props.title - Judul card (opsional)
 * @param {string} props.subtitle - Subtitle card (opsional)
 * @param {React.ReactNode} props.header - Custom header content (opsional)
 * @param {React.ReactNode} props.footer - Footer content (opsional)
 * @param {string} props.variant - Variant styling: 'default' | 'outlined' | 'elevated' | 'filled'
 * @param {string} props.color - Color variant: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Custom className tambahan
 * @param {Function} props.onClick - Click handler untuk seluruh card
 * @param {boolean} props.hoverable - Menambahkan hover effect
 * @param {boolean} props.loading - Status loading
 * @param {React.ReactNode} props.icon - Icon untuk header (opsional)
 * @param {React.ReactNode} props.actions - Action buttons di header (opsional)
 * @param {string} props.image - URL gambar untuk card (opsional)
 * @param {string} props.imagePosition - Posisi gambar: 'top' | 'left' | 'right'
 * @param {string} props.imageHeight - Height gambar (default: 'h-48')
 * @param {React.ReactNode} props.badge - Badge/tag untuk card (opsional)
 * @param {boolean} props.collapsible - Membuat card collapsible
 * @param {boolean} props.defaultCollapsed - Default state collapsed (jika collapsible)
 * @param {boolean} props.noPadding - Menghilangkan padding content
 */
export default function Card({
  children,
  title,
  subtitle,
  header,
  footer,
  variant = 'default',
  color = 'default',
  size = 'md',
  className = '',
  onClick,
  hoverable = false,
  loading = false,
  icon,
  actions,
  image,
  imagePosition = 'top',
  imageHeight = 'h-48',
  badge,
  collapsible = false,
  defaultCollapsed = false,
  noPadding = false,
  ...props
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Base styles - default text color untuk readability
  const baseStyles = 'rounded-lg transition-all duration-200 overflow-hidden text-zinc-900';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-zinc-200',
    outlined: 'bg-transparent border-2 border-zinc-300',
    elevated: 'bg-white shadow-lg border border-zinc-100',
    filled: 'bg-zinc-50 border border-zinc-200'
  };

  // Color variants - Menggunakan psikologi warna untuk status
  const colorStyles = {
    default: '',
    // Primary: Biru - kepercayaan, profesional, stabilitas
    primary: 'border-blue-300 bg-blue-50',
    // Success: Hijau - positif, berhasil, aman
    success: 'border-green-300 bg-green-50',
    // Warning: Orange/Kuning - perhatian, hati-hati, pending
    warning: 'border-orange-300 bg-orange-50',
    // Error: Merah - bahaya, error, gagal
    error: 'border-red-300 bg-red-50',
    // Info: Cyan/Sky - informasi, netral, tenang
    info: 'border-cyan-300 bg-cyan-50'
  };

  // Size variants for padding
  const sizeStyles = {
    sm: { header: 'px-4 py-3', body: 'p-4', footer: 'px-4 py-3' },
    md: { header: 'px-6 py-4', body: 'p-6', footer: 'px-6 py-4' },
    lg: { header: 'px-8 py-6', body: 'p-8', footer: 'px-8 py-6' }
  };

  const padding = sizeStyles[size];

  // Hover styles
  const hoverStyles = hoverable || onClick 
    ? 'hover:shadow-md hover:border-zinc-300 cursor-pointer' 
    : '';

  // Combined className
  const cardClassName = `${baseStyles} ${variantStyles[variant]} ${color !== 'default' ? colorStyles[color] : ''} ${hoverStyles} ${className}`;

  // Layout untuk horizontal card
  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';

  // Loading overlay
  if (loading) {
    return (
      <div className={cardClassName} {...props}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      </div>
    );
  }

  // Toggle collapse
  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Image element
  const imageElement = image && (
    <div className={`${imagePosition === 'top' ? imageHeight : isHorizontal ? 'w-1/3' : ''} overflow-hidden ${imagePosition === 'top' ? '' : 'flex-shrink-0'} relative`}>
      <Image 
        src={image} 
        alt={title || 'Card image'} 
        fill
        className="object-cover"
      />
    </div>
  );

  // Content wrapper
  const contentWrapper = (
    <>
      {/* Header Section */}
      {(header || title || icon || actions || badge) && (
        <div className={`${padding.header} border-b border-zinc-200 relative`}>
          {badge && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              {badge}
            </div>
          )}
          {header ? (
            header
          ) : (
            <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {icon && <div className="flex-shrink-0">{icon}</div>}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h3 className={`font-semibold text-zinc-900 truncate ${size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1 line-clamp-2">
                      {subtitle}
                    </p>
                  )}
                </div>
                {collapsible && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse();
                    }}
                    className="ml-2 text-zinc-400 hover:text-zinc-600 transition-transform duration-200"
                    style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {actions && <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">{actions}</div>}
            </div>
          )}
        </div>
      )}  

      {/* Content Section */}
      {!isCollapsed && (
        <div className={noPadding ? '' : padding.body}>
          {children}
        </div>
      )}

      {/* Footer Section */}
      {!isCollapsed && footer && (
        <div className={`${padding.footer} bg-zinc-50 border-t border-zinc-200`}>
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div className={cardClassName} onClick={onClick} {...props}>
      {/* Horizontal layout */}
      {isHorizontal ? (
        <div className="flex">
          {imagePosition === 'left' && imageElement}
          <div className="flex-1 flex flex-col">
            {contentWrapper}
          </div>
          {imagePosition === 'right' && imageElement}
        </div>
      ) : (
        /* Vertical layout */
        <>
          {imagePosition === 'top' && imageElement}
          {contentWrapper}
        </>
      )}
    </div>
  );
}

/**
 * CardHeader Component - Header terpisah untuk fleksibilitas lebih
 */
export function CardHeader({ children, className = '', size = 'md' }) {
  const sizeStyles = {
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  };
  
  return (
    <div className={`${sizeStyles[size]} border-b border-zinc-200 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardBody Component - Body terpisah untuk fleksibilitas lebih
 */
export function CardBody({ children, className = '', size = 'md', noPadding = false }) {
  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`${noPadding ? '' : sizeStyles[size]} text-zinc-900 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardFooter Component - Footer terpisah untuk fleksibilitas lebih
 */
export function CardFooter({ children, className = '', size = 'md' }) {
  const sizeStyles = {
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  };
  
  return (
    <div className={`${sizeStyles[size]} bg-zinc-50 border-t border-zinc-200 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardTitle Component - Title helper
 */
export function CardTitle({ children, className = '', size = 'md' }) {
  const sizeStyles = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };
  
  return (
    <h3 className={`${sizeStyles[size]} font-semibold text-zinc-900 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * CardDescription Component - Description helper
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-zinc-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * CardImage Component - Image helper
 */
export function CardImage({ src, alt = 'Card image', className = '', height = 'h-48' }) {
  return (
    <div className={`${height} overflow-hidden relative ${className}`}>
      <Image 
        src={src} 
        alt={alt} 
        fill
        className="object-cover"
      />
    </div>
  );
}

/**
 * CardBadge Component - Badge/Tag helper
 */
export function CardBadge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-cyan-100 text-cyan-700'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

/**
 * CardStats Component - Stats display helper
 */
export function CardStats({ label, value, trend, trendDirection, icon, className = '' }) {
  const trendColor = trendDirection === 'up' 
    ? 'text-green-600' 
    : trendDirection === 'down' 
    ? 'text-red-600' 
    : 'text-zinc-500';
    
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="text-2xl font-semibold text-zinc-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-sm mt-1 ${trendColor}`}>
            {trendDirection === 'up' && '↑ '}
            {trendDirection === 'down' && '↓ '}
            {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className="ml-4 text-zinc-400">
          {icon}
        </div>
      )}
    </div>
  );
}
