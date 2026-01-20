import React, { useState } from 'react';
import { resumeAPI } from '../utils/api';
import { extractTextFromFile } from '../utils/helpers';
import '../styles/resumeUpload.css';

export default function ResumeUpload({ userId, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Check file type
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        throw new Error('Only PDF and TXT files are supported');
      }

      // Extract text from file
      const resumeText = await extractTextFromFile(file);

      // Upload to backend
      const response = await resumeAPI.upload(userId, resumeText, file.name);
      setSuccess('Resume uploaded successfully!');
      onSuccess?.(response.data);
    } catch (err) {
      setError(err.message || 'Error uploading resume');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resume-upload-container">
      <h2>Upload Your Resume</h2>
      <div className="upload-area">
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          disabled={isLoading}
          id="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          📄 Click to upload or drag & drop
          <p>PDF or TXT (max 10MB)</p>
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {isLoading && <p className="loading">Uploading...</p>}
    </div>
  );
}
