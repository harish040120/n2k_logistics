import { useNavigate } from "react-router-dom";
import React from 'react';
import { motion } from 'framer-motion';
import { Package2, Users,UserCircle } from 'lucide-react';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";

function App() {

  const navigate = useNavigate();
  
  
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  const particlesLoaded = async (container) => {
    console.log(container);
  };
 
  
  const AnimatedTitle = () => {
    const text = "N2K LOGISTICS";
    
    // Animation variants for the container
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.1
        }
      }
    };
  
    // Animation variants for each letter
    const letterVariants = {
      hidden: { 
        opacity: 0,
        y: 20,
        rotate: -10
      },
      visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        transition: {
          duration: 0.8,
          ease: [0.2, 0.65, 0.3, 0.9],
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 2
        }
      }
    };
  
    // Hover animation for each letter
    const hoverVariants = {
      hover: (i) => ({
        y: [-2, -10, -2],
        scale: [1, 1.2, 1],
        rotate: [-2, 2, -2],
        transition: {
          duration: 0.3,
          ease: "easeInOut",
          delay: i * 0 // Removed delay for more responsive hover
        }
      })
    };
  
    return (
      <motion.h1 
        className="text-5xl font-bold mb-6 flex justify-center items-center space-x-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            variants={letterVariants}
            whileHover="hover"
            custom={i}
            className={`
              inline-block
              bg-clip-text text-transparent 
              bg-gradient-to-r from-red-500 to-red-700
              cursor-default
              ${char === " " ? "w-4" : ""}
            `}
            style={{
              textShadow: "0px 4px 12px rgba(255, 0, 0, 0.5)",
              filter: "drop-shadow(0 0 8px rgba(255, 0, 0, 0.3))"
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>
        );
      };
      
  return (
    <div className="relative z-10 w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate via-white to-white">
    {/* Full-screen Animated gradient background */}
    <div className="relative z-10 absolute inset-0 w-full h-full bg-gradient-to-r from-white via-white to-white animate-gradient-x"></div>
    
    {/* Ensure the gradient covers the full screen */}
    <div className="relative z-10 absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate via-white to-white"></div>

    {/* Wrapper for Background + Particles */}
<div className="relative z-10 absolute inset-0 w-full h-full z-0">
  <Particles
    id="tsparticles"
    init={particlesInit}
    loaded={particlesLoaded}
    options={{
      background: {
        opacity: 0 // Ensure background doesn't interfere
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: "#000"
        },
        links: {
          color: "#790000",
          distance: 100,
          enable: true,
          opacity: 0.2,
          width: 2
        },
        move: {
          enable: true,
          outModes: {
            default: "bounce"
          },
          speed: 2
        },
        number: {
          density: {
            enable: true,
            area: 700
          },
          value: 80
        },
        opacity: {
          value: 0.2
        },
        shape: {
          type: "circle"
        },
        size: {
          value: { min: 1, max: 3 }
        }
      },
      detectRetina: true
    }}
  />
</div>


      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 5 }}
          className="text-center mb-16"
        >
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 text-center">
          <motion.h1
  initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
  transition={{ duration: 2, ease: "easeOut" }}
  className="text-5xl font-bold text-white mb-6 relative"
>
  <motion.span
    animate={{
      rotateX: [0, 15, -15, 0],
      rotateY: [0, -10, 10, 0],
      scale: [1, 1.3, 1],
      letterSpacing: ["0px", "5px", "0px"],
      textShadow: [
        "0px 0px 5px rgba(255, 0, 0, 0.5)",
        "0px 0px 10px rgba(255, 0, 0, 1)",
        "0px 0px 5px rgba(255, 0, 0, 0.8)"
      ],
      color: ["#ef4444", "#dc2626", "#b91c1c", "#ef4444"],
      x: [-5, 5, -5, 0],
      y: [-3, 3, -3, 0],
    }}
    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600 drop-shadow-lg"
  >
    N2K LOGISTICS
  </motion.span>
</motion.h1>
        <p className="text-xl text-gray-500">Next-Generation Package Tracking & Delivery Solutions</p>
      </div>
          
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-8xl mx-auto">
      
      {/* Track Package Card */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        animate={{
          background: [
            "linear-gradient(135deg, rgba(240, 240, 240, 0.3), rgba(200, 200, 200, 0.5))",
            "linear-gradient(135deg, rgba(220, 220, 220, 0.3), rgba(180, 180, 180, 0.6))",
            "linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(190, 190, 190, 0.3))"
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-black/20 hover:border-red-500/50 transition-colors duration-300"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Package2 className="w-12 h-12 text-red-500" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-semibold text-black mb-4 text-center">Track Package</h2>
        <p className="text-gray-800 text-center mb-6">
          Real-time package tracking with precise location updates and estimated delivery times
        </p>
        <button onClick={() => navigate("/track")} className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300 transform hover:scale-105">
        
       
          Track Now
        </button>
      </motion.div>
      <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      animate={{
        background: [
          "linear-gradient(135deg, rgba(240, 240, 240, 0.3), rgba(200, 200, 200, 0.5))",
          "linear-gradient(135deg, rgba(220, 220, 220, 0.3), rgba(180, 180, 180, 0.6))",
          "linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(190, 190, 190, 0.3))",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-black/20 hover:border-red-500/50 transition-colors duration-300"
    >
      <div className="flex items-center justify-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Users className="w-12 h-12 text-red-500" />
        </motion.div>
      </div>
      <h2 className="text-2xl font-semibold text-black mb-4 text-center">
        Agent Booking
      </h2>
      <p className="text-gray-800 text-center mb-6">
          Manage your bookings and track orders with ease on your dedicated booking portal
      </p>
      <button
        onClick={() => navigate("/place-order")}
        className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
      >
        Book Now
      </button>
    </motion.div>
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
      animate={{
        background: [
          "linear-gradient(135deg, rgba(240, 240, 240, 0.3), rgba(200, 200, 200, 0.5))",
          "linear-gradient(135deg, rgba(220, 220, 220, 0.3), rgba(180, 180, 180, 0.6))",
          "linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(190, 190, 190, 0.3))",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-black/20 hover:border-red-500/50 transition-colors duration-300"
    >
      <div className="flex items-center justify-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <UserCircle className="w-12 h-12 text-red-500" />
        </motion.div>
      </div>
      <h2 className="text-2xl font-semibold text-black mb-4 text-center">
        C&F Booking
      </h2>
      <p className="text-gray-800 text-center mb-6">
          Manage your bookings and track orders with ease on your dedicated booking portal
      </p>
      <button
        onClick={() => navigate("/place-order")}
        className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
      >
        Book Now
      </button>
    </motion.div>
    

    </div>
    
    
      </div>
      
    </div>
  );
}

export default App;