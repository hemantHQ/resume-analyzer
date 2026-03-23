import React, { useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

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
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (validTypes.includes(file.type)) {
      onFileSelect(file);
    } else {
      alert('Please upload a PDF, JPEG, or PNG file.');
    }
  };

  if (selectedFile) {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between bg-white dark:bg-slate-800 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
            <FileIcon className="w-6 h-6" />
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button
          onClick={() => onFileSelect(null)}
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
        ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'}`}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
      />
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full">
          <UploadCloud className="w-8 h-8" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Click to upload or drag and drop</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">PDF, JPEG, JPG, or PNG (max. 10MB)</p>
    </div>
  );
}
