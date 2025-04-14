import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '/assets/logo.png';

function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16 relative">
          {/* Left Navigation Links */}
          <motion.div 
            className="hidden md:flex items-center space-x-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
          >
            {[
              { path: "/track", label: "Track Package" },
              { path: "/agent-signup", label: "Become an Agent" }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="relative group flex items-center"
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Link 
                  to={item.path} 
                  className="text-gray-700 hover:text-red-500 text-base font-medium transition-all duration-300 px-4 py-2 relative"
                >
                  {item.label}
                  {/* Red Hover Box */}
                  <motion.span 
                    className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md -z-10"
                  />
                </Link>
                {index !== 1 && <div className="border-r-2 border-red-500 h-6 mx-3" />}
              </motion.div>
            ))}
          </motion.div>

          {/* Logo Centered with Dynamic Animation */}
          
          <motion.div 
        initial={{ opacity: 0, y: -10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.1, rotate: [0, 2, -2, 0], transition: { duration: 0.4 } }}
        className="flex items-center"
      >
            <Link to="/">
              <img 
                src={logo}
                alt="Logo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            
          </motion.div>

          {/* Right Navigation Links */}
          <motion.div 
            className="hidden md:flex items-center space-x-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
          >
            {[
              { path: "/admin", label: "Admin Portal" },
              { path: "/driver", label: "Driver Portal" }
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="relative group flex items-center"
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Link 
                  to={item.path} 
                  className="text-gray-700 hover:text-red-500 text-base font-medium transition-all duration-300 px-4 py-2 relative"
                >
                  {item.label}
                  {/* Red Hover Box */}
                  <motion.span 
                    className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md -z-10"
                  />
                </Link>
                {index !== 1 && <div className="border-r-2 border-red-500 h-6 mx-2" />}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
