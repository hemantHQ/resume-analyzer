import React, { useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
      onFileSelect(file);
    } else {
      alert('Please upload a PDF or DOCX file.');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {selectedFile ? (
        <motion.div 
          key="selected"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="glass-panel rounded-xl p-4 flex items-center justify-between transition-colors duration-200"
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
              <FileIcon className="w-6 h-6" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{selectedFile.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={() => onFileSelect(null)}
            className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-zinc-300 dark:border-zinc-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm'}`}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleFileInput}
          />
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
              <UploadCloud className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">Click to upload or drag and drop</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">PDF or DOCX (max. 10MB)</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
