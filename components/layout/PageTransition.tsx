'use client';

import { motion } from 'motion/react';

/** Lightweight fade/slide-in wrapper applied to each route's content. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="print:p-0"
    >
      {children}
    </motion.div>
  );
}
