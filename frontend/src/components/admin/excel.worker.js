// public/excel.worker.js

// Import the xlsx library. Note: In a worker, you use importScripts.
// You need to have the xlsx library file available in your public folder.
// A simple way is to download the standalone version from the library's CDN/GitHub.
// For this example, we'll assume a file named 'xlsx.full.min.js' is in the public folder.
try {
  importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
} catch (e) {
  console.error("Failed to load xlsx library in worker:", e);
  // Post an error message back to the main thread if the script fails to load
  self.postMessage({ error: 'Failed to load xlsx library.' });
}


self.onmessage = (event) => {
  if (!self.XLSX) {
    // XLSX library didn't load, so we can't proceed.
    return;
  }
  
  const peopleData = event.data;

  try {
    // 1. Map the data to the desired Excel format
    const dataToExport = peopleData.map(p => ({
      'Name': p.name,
      'Gender': p.gender,
      'Age': p.age,
      'Booking #': p.bookingNumber,
      'Event': p.eventId?.name,
      'Stay From': new Date(p.stayFrom).toLocaleDateString(),
      'Stay To': new Date(p.stayTo).toLocaleDateString(),
      'Building': p.bedId?.roomId?.buildingId?.name,
      'Room #': p.bedId?.roomId?.roomNumber,
      'Bed': p.bedId?.name,
      'Ashram': p.ashramName,
      'City': p.city,
      'Booked By': p.userId?.name,
      'Contact': p.contactNumber,
      'Reference': p.baijiMahatmaJi,
    }));

    // 2. Create worksheet and workbook
    const worksheet = self.XLSX.utils.json_to_sheet(dataToExport);
    const workbook = self.XLSX.utils.book_new();
    self.XLSX.utils.book_append_sheet(workbook, worksheet, "Occupancy Report");

    // 3. Generate the file as a Blob
    // We use 'array' type to get an ArrayBuffer, which is easily convertible to a Blob.
    const excelBuffer = self.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // 4. Post the Blob back to the main thread
    self.postMessage(excelBlob);
    
  } catch (error) {
    console.error("Error in Excel worker:", error);
    self.postMessage({ error: 'An error occurred while generating the Excel file.' });
  }
};
