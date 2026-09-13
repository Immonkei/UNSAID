import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08090d',
          borderRadius: 8,
          border: '1px solid rgba(124, 153, 184, 0.45)',
          position: 'relative',
        }}
      >
        {/* Stylized Feather & Quote Icon Mark */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Feather spine and curve */}
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" stroke="#7C99B8" strokeWidth="1.75" />
          <line x1="17.5" y1="15" x2="9" y2="15" stroke="#7C99B8" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
