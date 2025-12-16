import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const city = searchParams.get('city') || 'Austin';
  const state = searchParams.get('state') || 'TX';
  const progress = searchParams.get('progress') || '88';
  const status = searchParams.get('status') || 'DRIVERLESS';

  const progressNum = parseInt(progress);
  const progressColor = progressNum >= 75 ? '#22c55e' : progressNum >= 50 ? '#eab308' : progressNum >= 25 ? '#f97316' : '#6b7280';
  const isDiverless = status === 'DRIVERLESS';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#fff',
              letterSpacing: '0.1em',
            }}
          >
            SHADOWMODE
          </div>
          <div
            style={{
              marginLeft: '20px',
              padding: '6px 12px',
              backgroundColor: isDiverless ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              border: `1px solid ${isDiverless ? 'rgba(34, 197, 94, 0.5)' : 'rgba(234, 179, 8, 0.5)'}`,
              borderRadius: '6px',
              color: isDiverless ? '#22c55e' : '#eab308',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {isDiverless ? 'DRIVERLESS' : 'IN PROGRESS'}
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '60px' }}>
          {/* Left side - City info */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '10px',
              }}
            >
              {city}, {state}
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#737373',
                marginBottom: '40px',
              }}
            >
              Tesla Robotaxi Deployment Progress
            </div>

            {/* Progress bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  width: '300px',
                  height: '16px',
                  backgroundColor: '#262626',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    width: `${progressNum}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius: '8px',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: progressColor,
                }}
              >
                {progress}%
              </div>
            </div>
          </div>

          {/* Right side - Visual indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              backgroundColor: isDiverless ? 'rgba(34, 197, 94, 0.1)' : 'rgba(115, 115, 115, 0.1)',
              border: `4px solid ${isDiverless ? '#22c55e' : '#525252'}`,
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: isDiverless ? '#22c55e' : '#737373',
              }}
            >
              {isDiverless ? '🚗' : '🔄'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #262626',
          }}
        >
          <div style={{ color: '#525252', fontSize: '18px' }}>
            shadowmode.us
          </div>
          <div style={{ color: '#525252', fontSize: '18px' }}>
            Real-time Tesla Robotaxi Tracker
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
