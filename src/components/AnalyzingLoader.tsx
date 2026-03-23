import React from 'react';
import { motion } from 'motion/react';
import { Search, FileText } from 'lucide-react';

export function AnalyzingLoader({ text = "Analyzing Resume..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8">
      <div className="relative w-32 h-32">
        {/* Document Background */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center text-indigo-100 dark:text-indigo-900/30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FileText className="w-24 h-24" strokeWidth={1.5} />
        </motion.div>

        {/* Scanning Lines on Document */}
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-30 dark:opacity-20">
          <div className="w-12 h-1 bg-indigo-300 dark:bg-indigo-600 rounded-full" />
          <div className="w-16 h-1 bg-indigo-300 dark:bg-indigo-600 rounded-full" />
          <div className="w-10 h-1 bg-indigo-300 dark:bg-indigo-600 rounded-full" />
          <div className="w-14 h-1 bg-indigo-300 dark:bg-indigo-600 rounded-full" />
        </div>

        {/* Magnifying Glass */}
        <motion.div
          className="absolute text-indigo-600 dark:text-indigo-400 drop-shadow-lg"
          animate={{
            x: [-20, 20, 20, -20, -20],
            y: [-20, -20, 20, 20, -20],
            rotate: [-10, 10, -10, 10, -10],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          style={{ top: '20%', left: '20%' }}
        >
          <Search className="w-12 h-12" strokeWidth={2.5} />
        </motion.div>
        
        {/* Scan line effect */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-indigo-500/50 dark:bg-indigo-400/50 shadow-[0_0_8px_2px_rgba(99,102,241,0.4)]"
          animate={{
            top: ['10%', '90%', '10%'],
          }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      </div>
      
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{text}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"
          />
          Extracting skills and keywords...
        </p>
      </motion.div>
    </div>
  );
}
