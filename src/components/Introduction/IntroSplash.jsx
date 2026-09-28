import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// Timeline (ms)
const BURST_AT = 350       // converging dust ignites into reveal flash
const LOGO_AT = 0          // start logo animation on load
const HOLD_UNTIL = 2200    // reveal page after logo lands
const FLASH_MS = 300       // bridge flash duration
const TOTAL_MS = HOLD_UNTIL + FLASH_MS

const LIGHT_BG_GRADIENT =
  'radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #FAF6EE 55%, #F4ECE0 100%)'

// Stagger animation variants for "WELCOME TO" text letters
const welcomeContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
}

const welcomeLetterVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.4 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 12,
    },
  },
}

export default function IntroSplash() {
  const [stage, setStage] = useState('playing') // 'playing' | 'bridging' | 'done'

  // Interactive 3D tilt tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 15,
  })
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 15,
  })

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window
    mouseX.set(e.clientX / innerWidth - 0.5)
    mouseY.set(e.clientY / innerHeight - 0.5)
  }

  // Floating background gradient blobs
  const bgBlobs = useMemo(
    () => [
      { id: 1, x: ['-20%', '10%', '-10%'], y: ['-20%', '20%', '-20%'], color: 'rgba(255, 190, 70, 0.25)', size: 'min(70vw, 500px)' },
      { id: 2, x: ['20%', '-15%', '15%'], y: ['30%', '-10%', '20%'], color: 'rgba(27, 101, 242, 0.12)', size: 'min(80vw, 550px)' },
      { id: 3, x: ['-10%', '15%', '-5%'], y: ['25%', '-20%', '15%'], color: 'rgba(255, 220, 130, 0.3)', size: 'min(65vw, 420px)' },
    ],
    []
  )

  // Ambient gold floating dust particles
  const ambientDust = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
        drift: -40 - Math.random() * 50,
      })),
    []
  )

  // Converging dust particles gathering toward center
  const convergingDust = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 200 + Math.random() * 300
        return {
          id: i,
          fromX: Math.cos(angle) * radius,
          fromY: Math.sin(angle) * radius,
          size: 2 + Math.random() * 3.5,
          delay: Math.random() * 0.35,
        }
      }),
    []
  )

  // Burst stars shooting outwards on ignition
  const burstStars = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + (Math.random() * 0.2 - 0.1)
        const dist = 150 + Math.random() * 200
        return {
          id: i,
          targetX: Math.cos(angle) * dist,
          targetY: Math.sin(angle) * dist,
          size: 12 + Math.random() * 10,
          rotation: Math.random() * 360,
        }
      }),
    []
  )

  const welcomeText = "WELCOME TO"

  useLayoutEffect(() => {
    document.documentElement.dataset.introSplash = stage === 'done' ? 'complete' : 'active'
    if (stage === 'done') {
      window.dispatchEvent(new Event('intro-splash-complete'))
    }
  }, [stage])

  useEffect(() => {
    const bridgeTimer = setTimeout(() => setStage('bridging'), HOLD_UNTIL)
    const doneTimer = setTimeout(() => setStage('done'), TOTAL_MS)

    return () => {
      clearTimeout(bridgeTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = stage === 'done' ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [stage])

  if (stage === 'done') return null

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#FAF6EE] select-none cursor-default"
    >
      {/* ---- Light Base Gradient Background ---- */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: LIGHT_BG_GRADIENT }}
      />

      {/* ---- Fluid Gradient Blobs ---- */}
      {bgBlobs.map((blob) => (
        <motion.div
          key={blob.id}
          aria-hidden
          className="absolute rounded-full pointer-events-none filter blur-[60px]"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
          }}
          animate={{
            x: blob.x,
            y: blob.y,
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 8 + blob.id * 2,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ---- Rotating Sunbeam Rays ---- */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none opacity-40"
        style={{
          width: '150vmax',
          height: '150vmax',
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(255,180,50,0.12) 15deg, transparent 35deg, transparent 150deg, rgba(27,101,242,0.08) 170deg, transparent 190deg, transparent 330deg, rgba(255,180,50,0.12) 345deg, transparent 360deg)',
          mixBlendMode: 'multiply',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, rotate: 360 }}
        transition={{
          opacity: { duration: 1 },
          rotate: { duration: 35, repeat: Infinity, ease: 'linear' },
        }}
      />

      {/* ---- Soft Pulsing Center Glow ---- */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none filter blur-[40px]"
        style={{
          width: 'min(90vw, 680px)',
          height: 'min(50vw, 380px)',
          background:
            'radial-gradient(ellipse at center, rgba(255, 195, 60, 0.35) 0%, rgba(27, 101, 242, 0.1) 55%, transparent 80%)',
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0, 1, 0.8, 1],
          scale: [0.5, 1, 1.08, 1],
        }}
        transition={{ duration: 1.8, delay: LOGO_AT / 1000, ease: 'easeOut' }}
      />

      {/* ---- Ambient Floating Gold Dust Particles ---- */}
      {ambientDust.map((d) => (
        <motion.span
          key={d.id}
          aria-hidden
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: '#E5A638',
            boxShadow: '0 0 6px 1px rgba(229, 166, 56, 0.4)',
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.8, 0], y: d.drift }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 1.2,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* ---- Converging Dust Particles ---- */}
      {convergingDust.map((d) => (
        <motion.span
          key={d.id}
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            width: d.size,
            height: d.size,
            background: '#FF9E1B',
            boxShadow: '0 0 8px 2px rgba(255, 158, 27, 0.5)',
          }}
          initial={{ x: d.fromX, y: d.fromY, opacity: 0, scale: 0.3 }}
          animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0.3, 1, 0.2] }}
          transition={{
            duration: 0.95,
            delay: d.delay,
            ease: [0.3, 0, 0.4, 1],
          }}
        />
      ))}

      {/* ---- Ignition Flash Expansion ---- */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 50,
          height: 50,
          background:
            'radial-gradient(circle, #ffffff 0%, #ffaa00 50%, transparent 75%)',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 18, 28] }}
        transition={{ duration: 0.65, delay: BURST_AT / 1000, ease: 'easeOut' }}
      />

      {/* ---- Starburst Sparkles Outward ---- */}
      {burstStars.map((star) => (
        <motion.svg
          key={star.id}
          aria-hidden
          viewBox="0 0 24 24"
          className="absolute left-1/2 top-1/2 pointer-events-none fill-[#FFA500]"
          style={{
            width: star.size,
            height: star.size,
            marginLeft: -star.size / 2,
            marginTop: -star.size / 2,
            filter: 'drop-shadow(0px 0px 6px rgba(255,165,0,0.8))',
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: star.rotation }}
          animate={{
            x: star.targetX,
            y: star.targetY,
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            rotate: star.rotation + 180,
          }}
          transition={{
            duration: 0.85,
            delay: BURST_AT / 1000 + 0.05,
            ease: 'easeOut',
          }}
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </motion.svg>
      ))}

      {/* ---- Interactive Container (Holds Animated Text & Logo) ---- */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center p-4 text-center w-full max-w-4xl mx-auto"
        style={{ rotateX: tiltX, rotateY: tiltY, perspective: 1000 }}
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: LOGO_AT / 1000 },
          scale: {
            duration: 0.85,
            delay: LOGO_AT / 1000,
            type: 'spring',
            stiffness: 110,
            damping: 14,
          },
          y: {
            duration: 3,
            delay: LOGO_AT / 1000 + 0.85,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          },
        }}
      >
        {/* ---- LARGER & PROPERLY CENTERED "WELCOME TO" TEXT ---- */}
        <motion.div
          className="flex justify-center items-center mb-4 sm:mb-6 font-extrabold tracking-[0.35em] pl-[0.35em] text-2xl sm:text-4xl md:text-5xl lg:text-6xl uppercase select-none w-full text-center"
          variants={welcomeContainerVariants}
          initial="hidden"
          animate="visible"
          style={{
            color: '#D97706', // Warm amber / golden accent
            textShadow: '0px 4px 18px rgba(217, 119, 6, 0.3)',
          }}
        >
          {welcomeText.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={welcomeLetterVariants}
              className={char === ' ' ? 'w-4 sm:w-6 md:w-8' : 'inline-block'}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* ---- LOGO IMAGE ---- */}
        <div className="relative flex items-center justify-center w-full">
          <img
            src="/akademix-logo.png"
            alt="Akademix"
            className="w-[min(80vw,480px)] select-none pointer-events-none"
            style={{
              filter: 'drop-shadow(0px 14px 32px rgba(13, 44, 98, 0.16))',
            }}
            draggable="false"
          />

          {/* Dynamic Light Sheen Sweep Across Logo */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(75deg, transparent 35%, rgba(255, 255, 255, 0.9) 50%, transparent 65%)',
              mixBlendMode: 'overlay',
            }}
            initial={{ x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{
              duration: 0.95,
              delay: LOGO_AT / 1000 + 0.45,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      {/* ---- Transition Flash to Main Site ---- */}
      {stage === 'bridging' && (
        <motion.div
          aria-hidden
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ background: '#ffffff' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: FLASH_MS / 1000, ease: 'easeIn' }}
        />
      )}
    </div>
  )
}