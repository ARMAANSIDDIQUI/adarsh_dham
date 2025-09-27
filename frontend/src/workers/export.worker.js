// This file is a Web Worker, it runs in a separate thread.
self.onmessage = async (event) => {
  const { type, url } = event.data;
  if (type === 'export_bookings') {
    try {
      const response = await fetch(`${url}/api/admin/export-bookings`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = function(e) {
        self.postMessage({ type: 'success', data: e.target.result });
      };
      reader.onerror = function() {
        self.postMessage({ type: 'error', data: 'Failed to read blob.' });
      };
      reader.readAsArrayBuffer(blob);

    } catch (error) {
      self.postMessage({ type: 'error', data: error.message });
    }
  }
};