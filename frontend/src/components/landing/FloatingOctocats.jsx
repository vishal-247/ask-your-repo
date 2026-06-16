import React from 'react';

export function FloatingOctocats() {
  const octocats = [
    { id: 1, size: 80, top: '15%', left: '10%', delay: '0s', duration: '20s' },
    { id: 2, size: 120, top: '45%', left: '85%', delay: '3s', duration: '25s' },
    { id: 3, size: 60, top: '75%', left: '15%', delay: '1.5s', duration: '18s' },
    { id: 4, size: 100, top: '10%', left: '75%', delay: '5s', duration: '28s' },
    { id: 5, size: 90, top: '65%', left: '50%', delay: '2.5s', duration: '22s' },
    { id: 6, size: 70, top: '30%', left: '40%', delay: '6s', duration: '24s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes float-around {
          0% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-20px) rotate(10deg) scale(1.05);
          }
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
        }
        .float-octo {
          animation: float-around infinite ease-in-out;
        }
      `}</style>
      {octocats.map((octo) => (
        <svg
          key={octo.id}
          className="absolute float-octo text-[#5b4fcf]/[0.03] dark:text-white/[0.02]"
          style={{
            top: octo.top,
            left: octo.left,
            width: `${octo.size}px`,
            height: `${octo.size}px`,
            animationDelay: octo.delay,
            animationDuration: octo.duration,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ))}
    </div>
  );
}
