import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaDownload } from 'react-icons/fa';
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-10 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800">Export Data</h2>
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 mb-6 text-base md:text-lg">
            Click the button below to export all booking requests to an XLSX file. This process may take a moment.
          </p>
          <Button 
            onClick={handleExport} 
            disabled={loading} 
            className="w-full sm:w-auto px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-colors"
          >
            {loading ? 'Processing...' : (
              <>
                <FaDownload className="inline mr-2 text-xl" />
                Export Bookings
              </>
            )}
          </Button>
          {status && <p className="mt-4 text-sm font-medium text-gray-500">{status}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ExportData;