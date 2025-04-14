import React from 'react';
import { motion } from 'framer-motion';
import logo from '/assets/logo.png';

function Footer() {
  const locations = [
    'Erode', 'Coimbatore', 'Tiruchirappalli', 'Salem'
  ];

  const socialMedia = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M22,12.07 C22,6.48 17.52,2 12,2 C6.48,2 2,6.48 2,12.07 C2,17.06 6.17,21.13 11.14,21.88 V14.89 H8.08 V12.07 H11.14 V9.797 C11.14,7.593 12.94,6.06 15.21,6.06 C16.33,6.06 17.48,6.27 17.48,6.27 V9.34 H16.28 C14.99,9.34 14.67,10.07 14.67,10.85 V12.07 H17.33 L16.82,14.89 H14.67 V21.88 C19.64,21.13 23.81,17.06 23.81,12.07 L22,12.07 Z" />
        </svg>
      ),
    },
    {
      name: 'X',
      href: 'https://x.com',
      icon: (
        <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M16.88 3H21l-7.49 8.62L22.34 21H15.8l-4.88-6.1L5.2 21H1l8.36-9.64L2.08 3h6.72l4.38 5.48L16.88 3z" />
      </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.75 2.24 5 5 5h14c2.76 0 5-2.25 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.3c-0.966 0-1.75-0.784-1.75-1.75s0.784-1.75 1.75-1.75 1.75 0.784 1.75 1.75-0.784 1.75-1.75 1.75zm13.5 11.3h-3v-5.6c0-1.34-0.02-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.96v5.69h-3v-10h2.88v1.37h0.04c0.4-0.76 1.37-1.56 2.82-1.56 3.02 0 3.58 1.99 3.58 4.59v5.61z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="bg-gray-800 text-white py-8 mt-12"
    >
      <div className="container mx-auto px-4 text-center">
        {/* Locations */}
        <div className="mb-4 flex justify-center">
          <img src={logo} alt="Website Logo" className="h-16" />
        </div>
        <p className="text-sm text-gray-300">{locations.join(' | ')}</p>

        {/* Social Media Links */}
        <div className="mt-6 flex justify-center space-x-6">
          {socialMedia.map((social, idx) => (
            <motion.a
              key={idx}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-3xl"
              whileHover={{ rotate: 10, scale: 1.2, color: '#ff5555' }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <motion.div
          className="mt-6 text-center text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          &copy; {new Date().getFullYear()} N2K Logistics. All rights reserved.
        </motion.div>
      </div>
    </motion.footer>
  );
}

export default Footer;
