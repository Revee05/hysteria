import { useState, useId, useEffect } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export function Logo({ className = '', size = 32, initials = 'H', bgColor = '#F3F4F6', textColor = '#374151', label = 'Hysteria logo' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={label}
    >
      <rect x="6" y="6" width="36" height="36" rx="8" fill={bgColor} />
      <text x="24" y="30" textAnchor="middle" fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto" fontSize={18} fontWeight={700} fill={textColor}>{initials}</text>
    </svg>
  );
}

export function IconDashboard({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" fill="#6B7280" />
    </svg>
  );
}

export function IconUsers({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSettings({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 014.28 17.9l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.2 6.6A2 2 0 016.99 3.77l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 0010 3.9V3a2 2 0 014 0v.09c.2.07.39.18.56.31.7.49 1.57.4 2.16-.19l.06-.06A2 2 0 0119.4 6.6l-.06.06c-.49.7-.4 1.57.19 2.16.13.17.24.36.31.56H21a2 2 0 010 4h-.09c-.16.58-.72 1-1.31 1z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSection({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6B7280" strokeWidth="1.2" fill="none" />
      <path d="M3 9h18" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M3 15h18" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlatform({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="#6B7280" strokeWidth="1.2" fill="none" />
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="#6B7280" strokeWidth="1.2" fill="none" />
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="#6B7280" strokeWidth="1.2" fill="none" />
      <rect x="13" y="13" width="8" height="8" rx="1" stroke="#6B7280" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function IconEvent({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      <path d="M16 3v4M8 3v4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11h10M7 15h10" stroke="#6B7280" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPost({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M8 6h8v2H8zM8 10h8v2H8zM8 14h5v2H8z" fill="#6B7280" />
      <rect x="3" y="4" width="14" height="16" rx="2" stroke="#6B7280" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function IconSocial({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <circle cx="6" cy="12" r="2" stroke="#6B7280" strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="6" r="2" stroke="#6B7280" strokeWidth="1.4" fill="none" />
      <circle cx="18" cy="16" r="2" stroke="#6B7280" strokeWidth="1.4" fill="none" />
      <path d="M8 11l6-4" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13l6 3" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInstagram({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconFacebook({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M14.5 8.5h1.9v2.2h-1.9v6H12v-6h-1.3V9.7H12V8.6c0-1.1.6-2.6 2.5-2.6h1.5v1.5h-.5c-.4 0-.9.2-.9.9v.7z" fill="currentColor" />
    </svg>
  );
}

export function IconTikTok({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M9 8v6.5A3.5 3.5 0 0012.5 18 3.5 3.5 0 0016 14.5V7h2.5" stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12.5" cy="5" r="0.8" fill="#6B7280" />
    </svg>
  );
}

export function IconThreads({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M12 3c4.97 0 9 3.58 9 8 0 4.42-4.03 8-9 8s-9-3.58-9-8c0-2.76 2.24-5 5-5 .9 0 1.75.25 2.45.68" stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="8.5" r="1" fill="#ced0d4" />
    </svg>
  );
}

export function IconX({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M18.244 2H21.552L14.325 10.26L22.5 22H15.902L10.742 14.657L4.39 22H1.08L8.815 13.112L1 2H7.764L12.43 8.709L18.244 2ZM17.094 20.13H18.93L6.78 3.78H4.81L17.094 20.13Z" />
    </svg>
  );
}


export function IconLinkedIn({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="#6B7280" strokeWidth="1.2" fill="none" />
      <rect x="6" y="9" width="2" height="7" fill="#6B7280" />
      <circle cx="7" cy="6.5" r="1" fill="#6B7280" />
      <path d="M11 9h2.2v1h.03c.31-.58 1.07-1 1.87-1 2 0 2.9 1.3 2.9 3.2V16h-2.2v-3.2c0-.76-.01-1.74-1.06-1.74-1.06 0-1.22.83-1.22 1.68V16H11V9z" fill="#6B7280" />
    </svg>
  );
}

export function IconYoutube({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M10 9.5l5 2.5-5 2.5V9.5z" fill="currentColor" />
    </svg>
  );
}

export function IconSpeaker({ className = '', size = 20, initialMuted = false, muted: mutedProp, onChange }) {
  const isControlled = typeof mutedProp !== 'undefined';
  const [internalMuted, setInternalMuted] = useState(initialMuted);
  const muted = isControlled ? mutedProp : internalMuted;

  useEffect(() => {
    if (!isControlled) return;
    // when controlled, keep internal state in sync for any local reads
    setInternalMuted(mutedProp);
  }, [mutedProp, isControlled]);

  const toggle = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const next = !muted;
    if (!isControlled) setInternalMuted(next);
    if (onChange) onChange(next);
  };

  const Icon = muted ? VolumeOffIcon : VolumeUpIcon;

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute' : 'Mute'}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon style={{ width: size, height: size }} />
    </button>
  );
}

export function Avatar({
  className = '',
  size = 32,
  borderColor = '#D1D5DB',
  borderWidth = 1,
  hoverBorderColor = '#9CA3AF',
  hoverBorderWidth = 2.5,
  hoverScale = 1.05,
  src = '',
  alt = '',
  ariaLabel = 'User avatar',
}) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const id = useId();
  const uid = String(id).replace(/:/g, '');
  const clipId = `avatar-clip-${uid}`;

  const strokeColor = hover ? hoverBorderColor : borderColor;
  const strokeW = hover ? hoverBorderWidth : borderWidth;

  const showImage = src && !imgError;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      overflow="visible"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      focusable="false"
      style={{
        transform: hover ? `scale(${hoverScale})` : 'scale(1)',
        transformOrigin: 'center',
        transition: 'transform 180ms cubic-bezier(.2,.9,.2,1), stroke 180ms ease, box-shadow 180ms ease',
        boxShadow: hover ? '0 8px 20px rgba(15,23,42,0.12)' : 'none',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>

      <circle cx="12" cy="12" r="12" stroke={strokeColor} strokeWidth={strokeW} fill="none" />

      {showImage ? (
        <>
          <circle cx="12" cy="12" r="10" fill="#E6E7EA" />
          <image
            href={src}
            x="2"
            y="2"
            width="20"
            height="20"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            onError={() => setImgError(true)}
            alt={alt}
          />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" fill="#E6E7EA" />
          <path d="M12 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" fill="#6B7280" />
          <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4v1H4v-1z" fill="#6B7280" />
        </>
      )}
    </svg>
  );
}

export function IconTelephone({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 014.09 5.18 2 2 0 016 3h3a2 2 0 012 1.72c.12.99.38 2 .76 2.98a2 2 0 01-.45 2.11L10.91 9.09a16 16 0 006 6l1.18-1.18a2 2 0 012.11-.45c.98.38 1.99.64 2.98.76A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IconMap({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M3 6l7-3 7 3 7-3v13l-7 3-7-3L3 20V6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10 3v14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6v14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconEnvelope({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function IconMenu({ className = '', size = 20 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
