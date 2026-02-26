import Image from 'next/image'
import PropTypes from 'prop-types'

export default function PosterCard({ src, alt, title, subtitle, className = '', onClick, style }) {
  return (
    <div className={`poster-card ${className}`} style={style} onClick={onClick}>
      <div className="image-wrap">
        <Image src={src} alt={alt || title || 'poster'} fill sizes="(max-width:480px) 100vw, 300px" style={{ objectFit: 'cover' }} />
      </div>

      <div className="overlay">
        <div className="text">
          {title && <h3 className="title">{title}</h3>}
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      </div>

      <style jsx>{`
        .poster-card {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          border-radius: 8px;
          cursor: pointer;
          background: #eee;
        }

        .image-wrap {
          position: absolute;
          inset: 0;
        }

        .overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 12px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%);
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 180ms ease, transform 180ms ease;
        }

        .poster-card:hover .overlay,
        .poster-card:focus-within .overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .text {
          color: #fff;
        }

        .title {
          margin: 0 0 4px 0;
          font-size: 1rem;
          line-height: 1.1;
          font-weight: 600;
          text-shadow: 0 1px 4px rgba(0,0,0,0.6);
        }

        .subtitle {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.9;
        }
      `}</style>
    </div>
  )
}

PosterCard.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object,
}
