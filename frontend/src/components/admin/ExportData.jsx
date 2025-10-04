import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import ExportWorker from '../../workers/export.worker.js';

const ExportData = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    setStatus('Exporting data...');

    const worker = new ExportWorker();
    worker.postMessage({ type: 'export_bookings', url: process.env.REACT_APP_BACKEND_URL });

    worker.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'success') {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookings.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setStatus('Download complete!');
      } else if (type === 'error') {
        setStatus(`Export failed: ${data}`);
      }
      setLoading(false);
      worker.terminate();
    };
  };

  const statusColor = status.includes('failed') 
    ? 'text-highlight' 
    : status.includes('complete') 
    ? 'text-accent' 
    : 'text-gray-700';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 md:p-10 bg-neutral min-h-screen flex items-center justify-center font-body"
    >
      <div className="w-full max-w-lg">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-center text-gray-800">Export Data</h2>
        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-soft text-center">
          <p className="text-gray-700 mb-6 text-base md:text-lg">
            Click the button below to export all booking requests to an XLSX file. This process may take a moment.
          </p>
          <Button 
            onClick={handleExport} 
            disabled={loading} 
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primaryDark text-white font-semibold rounded-xl shadow-soft transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="inline mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaDownload className="inline mr-2 text-xl" />
                Export Bookings
              </>
            )}
          </Button>
          {status && <p className={`mt-4 text-sm font-medium ${statusColor}`}>{status}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ExportData;