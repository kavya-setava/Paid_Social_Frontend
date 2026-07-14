import React, { useEffect, useRef, useState } from "react";

const NetflixIntro = () => {
  const audioRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    
    // Function to start audio
    const startAudio = async () => {
      if (audioStarted || !audio) return;
      
      try {
        audio.muted = false;
        audio.currentTime = 0;
        
        // Reset audio to ensure it plays from start
        await audio.play();
        setAudioStarted(true);
        console.log("Audio started successfully");
      } catch (err) {
        console.log("Autoplay blocked:", err);
        
        // Fallback: wait for user interaction
        const unlockAudio = async () => {
          try {
            await audio.play();
            setAudioStarted(true);
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
          } catch (e) {
            console.log("Audio unlock failed:", e);
          }
        };
        
        document.addEventListener("click", unlockAudio);
        document.addEventListener("touchstart", unlockAudio);
        
        // Auto attempt after 1 second
        setTimeout(async () => {
          if (!audioStarted) {
            try {
              await audio.play();
              setAudioStarted(true);
            } catch (e) {
              console.log("Auto attempt failed");
            }
          }
        }, 1000);
      }
    };

    // Preload audio
    if (audio) {
      audio.load();
      audio.volume = 1;
      
      // Start audio immediately with animation
      const startAnimationAndAudio = async () => {
        // Start audio first (it will be blocked by browser policies but we try)
        await startAudio();
        
        // Force audio start with a small delay to sync with animation
        setTimeout(() => {
          if (!audioStarted && audio) {
            audio.play().catch(e => console.log("Delayed play failed:", e));
          }
        }, 100);
      };
      
      startAnimationAndAudio();
    }

    // Auto close intro after 6 seconds
    const timer = setTimeout(() => {
      // Fade out effect before removing
      const introElement = document.querySelector('.netflix-intro-container');
      if (introElement) {
        introElement.style.transition = 'opacity 0.5s ease';
        introElement.style.opacity = '0';
      }
      
      setTimeout(() => {
        setShowIntro(false);
        // Stop audio when intro closes
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }, 500);
    }, 6000);

    return () => {
      clearTimeout(timer);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Force audio to play when user interacts with the intro
  const handleIntroClick = async () => {
    const audio = audioRef.current;
    if (audio && !audioStarted) {
      try {
        await audio.play();
        setAudioStarted(true);
      } catch (err) {
        console.log("Manual play failed:", err);
      }
    }
  };

  if (!showIntro) return null;

  return (
    <>
      {/* AUDIO */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        muted={false}
        loop={false}
      >
        <source
          src="/netflix-audio.mp3"
          type="audio/mpeg"
        />
      </audio>

      <div 
        className="netflix-intro-container"
        onClick={handleIntroClick}
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          opacity: 1,
          transition: "opacity 0.5s ease"
        }}
      >
        {/* Background Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, rgba(229,9,20,0.15), transparent 70%)",
          }}
        />

        {/* Animated Rays */}
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "80px",
              height: "200%",
              background: "linear-gradient(to bottom, rgba(229,9,20,0.5), transparent)",
              left: `${i * 8}%`,
              top: "-50%",
              transform: i % 2 === 0 ? "rotate(12deg)" : "rotate(-12deg)",
              filter: "blur(25px)",
              animation: `lightMove ${3 + i * 0.2}s infinite ease-in-out`,
            }}
          />
        ))}

        {/* NETFLIX N */}
        <div
          style={{
            position: "relative",
            width: "260px",
            height: "340px",
            animation: "zoomLogo 2s ease forwards",
          }}
        >
          {/* Left Pillar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "70px",
              height: "100%",
              background: "linear-gradient(to right, #7f0000, #E50914)",
              boxShadow: "0 0 40px rgba(229,9,20,0.9)",
              animation: "slideLeft 1s ease",
              zIndex: 3,
            }}
          />

          {/* Middle Diagonal */}
          <div
            style={{
              position: "absolute",
              left: "101px",
              top: "-18px",
              width: "42px",
              height: "118%",
              background: "linear-gradient(to right, #ff4d4d, #b20710)",
              transform: "rotate(-21.5deg)",
              transformOrigin: "center",
              zIndex: 5,
              borderRadius: "2px",
              boxShadow: `
                0 0 25px rgba(229,9,20,0.9),
                0 0 60px rgba(255,0,0,0.75)
              `,
              animation: "growMiddle 1.2s ease",
            }}
          />

          {/* Right Pillar */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "70px",
              height: "100%",
              background: "linear-gradient(to right, #b20710, #5c0000)",
              boxShadow: "0 0 40px rgba(229,9,20,0.9)",
              animation: "slideRight 1s ease",
              zIndex: 1,
            }}
          />
        </div>

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            background: "rgba(229,9,20,0.2)",
            filter: "blur(140px)",
            borderRadius: "50%",
            animation: "pulse 2s infinite",
          }}
        />

        {/* Bottom Text */}
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            color: "#fff",
            fontSize: "13px",
            letterSpacing: "5px",
            opacity: 0.6,
            animation: "pulse 1.5s infinite",
          }}
        >
          NETFLIX EXPERIENCE
        </div>

        {/* Click to play indicator (only shown if audio hasn't started) */}
        {!audioStarted && (
          <div
            style={{
              position: "absolute",
              bottom: "50px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#e50914",
              fontSize: "12px",
              background: "rgba(0,0,0,0.7)",
              padding: "8px 16px",
              borderRadius: "20px",
              pointerEvents: "none",
              animation: "pulse 1s infinite"
            }}
          >
            Click anywhere for audio
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideLeft {
            from {
              transform: translateX(-250px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideRight {
            from {
              transform: translateX(250px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes growMiddle {
            from {
              transform: rotate(-21.5deg) scaleY(0);
              opacity: 0;
            }
            to {
              transform: rotate(-21.5deg) scaleY(1);
              opacity: 1;
            }
          }

          @keyframes zoomLogo {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            60% {
              transform: scale(1.08);
              opacity: 1;
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes pulse {
            0% {
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.5;
            }
          }

          @keyframes lightMove {
            0% {
              transform: translateY(0) rotate(10deg);
            }
            50% {
              transform: translateY(-30px) rotate(-10deg);
            }
            100% {
              transform: translateY(0) rotate(10deg);
            }
          }
        `}
      </style>
    </>
  );
};

export default NetflixIntro;