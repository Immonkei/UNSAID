import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'UNSAID — Say what you can’t say';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#08090d',
          backgroundImage:
            'radial-gradient(ellipse at 50% 30%, rgba(124, 153, 184, 0.28) 0%, rgba(8, 9, 13, 0) 70%), radial-gradient(ellipse at 20% 80%, rgba(49, 46, 129, 0.22) 0%, rgba(8, 9, 13, 0) 65%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Subtle border outline */}
        <div
          style={{
            position: 'absolute',
            inset: 32,
            borderRadius: 36,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#7C99B8',
              marginRight: 16,
              boxShadow: '0 0 16px #7C99B8',
            }}
          />
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 22,
              letterSpacing: '0.35em',
              fontWeight: 700,
              color: '#d4d4d8',
              textTransform: 'uppercase',
            }}
          >
            U N S A I D
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'Georgia, serif',
            fontSize: 74,
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#fafafa',
            textAlign: 'center',
            marginBottom: 28,
            letterSpacing: '-0.02em',
          }}
        >
          “Say what you can’t say.”
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'sans-serif',
            fontSize: 24,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: 820,
            lineHeight: 1.45,
          }}
        >
          An anonymous collective archive of unspoken confessions, midnight thoughts, and quiet feelings.
        </div>

        {/* Domain footer pill */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            alignItems: 'center',
            padding: '10px 24px',
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: '#7C99B8',
              fontFamily: 'sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            unsaidthoughts.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
