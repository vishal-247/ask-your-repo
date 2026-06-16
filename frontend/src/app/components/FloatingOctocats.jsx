import { motion } from "motion/react";

const octocatPositions = [
  {
    x: "4%",
    y: "8%",
    size: 22,
    delay: 0,
    duration: 7,
    opacity: 0.12,
    rotate: -15,
  },
  {
    x: "12%",
    y: "55%",
    size: 16,
    delay: 1.2,
    duration: 9,
    opacity: 0.09,
    rotate: 20,
  },
  {
    x: "7%",
    y: "80%",
    size: 26,
    delay: 0.5,
    duration: 8,
    opacity: 0.13,
    rotate: -8,
  },
  {
    x: "20%",
    y: "22%",
    size: 14,
    delay: 2.1,
    duration: 11,
    opacity: 0.08,
    rotate: 30,
  },
  {
    x: "25%",
    y: "72%",
    size: 19,
    delay: 0.8,
    duration: 7.5,
    opacity: 0.1,
    rotate: 10,
  },
  {
    x: "35%",
    y: "5%",
    size: 17,
    delay: 1.7,
    duration: 10,
    opacity: 0.08,
    rotate: -20,
  },
  {
    x: "42%",
    y: "88%",
    size: 24,
    delay: 0.3,
    duration: 8.5,
    opacity: 0.11,
    rotate: 5,
  },
  {
    x: "55%",
    y: "15%",
    size: 13,
    delay: 2.5,
    duration: 9.5,
    opacity: 0.07,
    rotate: 25,
  },
  {
    x: "60%",
    y: "65%",
    size: 20,
    delay: 1.0,
    duration: 7,
    opacity: 0.1,
    rotate: -12,
  },
  {
    x: "68%",
    y: "40%",
    size: 15,
    delay: 3.0,
    duration: 11,
    opacity: 0.07,
    rotate: 18,
  },
  {
    x: "72%",
    y: "82%",
    size: 27,
    delay: 0.6,
    duration: 8,
    opacity: 0.12,
    rotate: -5,
  },
  {
    x: "78%",
    y: "10%",
    size: 18,
    delay: 1.5,
    duration: 10,
    opacity: 0.09,
    rotate: 22,
  },
  {
    x: "85%",
    y: "55%",
    size: 14,
    delay: 2.3,
    duration: 9,
    opacity: 0.08,
    rotate: -30,
  },
  {
    x: "90%",
    y: "28%",
    size: 23,
    delay: 0.9,
    duration: 7.5,
    opacity: 0.11,
    rotate: 8,
  },
  {
    x: "93%",
    y: "75%",
    size: 16,
    delay: 1.8,
    duration: 10,
    opacity: 0.08,
    rotate: -18,
  },
  {
    x: "48%",
    y: "48%",
    size: 12,
    delay: 3.5,
    duration: 12,
    opacity: 0.06,
    rotate: 15,
  },
  {
    x: "32%",
    y: "38%",
    size: 11,
    delay: 4.0,
    duration: 9,
    opacity: 0.06,
    rotate: -25,
  },
  {
    x: "63%",
    y: "92%",
    size: 15,
    delay: 2.8,
    duration: 8,
    opacity: 0.07,
    rotate: 12,
  },
];

function OctocatSVG({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={color}
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function FloatingOctocats() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {octocatPositions.map((pos, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            rotate: pos.rotate,
          }}
          animate={{
            y: [0, -14, 4, -8, 0],
            x: [0, 5, -4, 3, 0],
            rotate: [
              pos.rotate,
              pos.rotate + 8,
              pos.rotate - 5,
              pos.rotate + 3,
              pos.rotate,
            ],
            opacity: [
              pos.opacity,
              pos.opacity * 1.4,
              pos.opacity * 0.7,
              pos.opacity * 1.2,
              pos.opacity,
            ],
          }}
          transition={{
            duration: pos.duration,
            delay: pos.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <OctocatSVG size={pos.size} color="#5b4fcf" />
        </motion.div>
      ))}
    </div>
  );
}
