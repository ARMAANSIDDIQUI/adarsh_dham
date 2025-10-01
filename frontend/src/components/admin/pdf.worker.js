// public/pdf.worker.js

// NOTE: The importScripts() calls have been removed.
// The necessary libraries (jsPDF and jsPDF-AutoTable) will be pre-loaded
// by the main application before this worker is initialized.

// --- Helper Functions ---
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


// --- Main Worker Logic ---
self.onmessage = (event) => {
    // Gracefully handle cases where the PDF library failed to load
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        console.error("jsPDF library is not available in the worker. It may not have been pre-loaded correctly.");
        self.postMessage({ error: 'PDF generation library could not be loaded.' });
        return;
    }

    const { jsPDF } = jspdf;
    const { type, data } = event.data;

    try {
        if (type === 'ALL') {
            generateAllPdf(data, jsPDF);
        } else if (type === 'SINGLE') {
            generateSinglePdf(data, jsPDF);
        }
    } catch (error) {
        console.error("Error in PDF worker:", error);
        self.postMessage({ error: `An error occurred while generating the PDF file: ${error.message}` });
    }
};

// --- PDF Generation Functions ---

function generateAllPdf(peopleData, jsPDF) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Occupancy Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    const tableColumn = ["Name", "Booking #", "Stay Dates", "Allocation", "Contact"];
    const tableRows = [];

    peopleData.forEach(person => {
        const stayDates = `${formatDate(person.stayFrom)} - ${formatDate(person.stayTo)}`;
        const allocation = `${person.bedId?.roomId?.buildingId?.name || 'N/A'}\nRoom ${person.bedId?.roomId?.roomNumber || 'N/A'} / Bed ${person.bedId?.name || 'N/A'}`;
        const personData = [
            `${person.name}\n${person.gender}, Age: ${person.age}`,
            `${person.bookingNumber}\n${person.city}`,
            stayDates,
            allocation,
            `${person.userId?.name || 'N/A'}\n${person.contactNumber || 'N/A'}`,
        ];
        tableRows.push(personData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [255, 192, 203] } // Light pink for header
    });
    
    const pdfBlob = doc.output('blob');
    const filename = `OccupancyReport_All_${new Date().toISOString().split('T')[0]}.pdf`;

    self.postMessage({ blob: pdfBlob, filename });
}

function generateSinglePdf(person, jsPDF) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Occupancy Record", 105, 20, { align: 'center' });

    // Person Details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(person.name || 'N/A', 20, 40);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gender: ${person.gender || 'N/A'}`, 20, 48);
    doc.text(`Age: ${person.age || 'N/A'}`, 70, 48);
    
    // Line separator
    doc.line(20, 55, 190, 55);

    // Booking Details
    doc.setFont('helvetica', 'bold');
    doc.text("Booking Details", 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booking Number:`, 20, 75);
    doc.setFont('courier', 'bold');
    doc.text(`${person.bookingNumber || 'N/A'}`, 70, 75);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Event:`, 20, 82);
    doc.text(`${person.eventId?.name || 'N/A'}`, 70, 82);
    doc.text(`Ashram/City:`, 20, 89);
    doc.text(`${person.ashramName || 'N/A'}, ${person.city || 'N/A'}`, 70, 89);

    // Stay and Allocation
    doc.setFont('helvetica', 'bold');
    doc.text("Stay & Allocation", 20, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Stay From:`, 20, 115);
    doc.text(formatDate(person.stayFrom), 70, 115);
    doc.text(`Stay To:`, 20, 122);
    doc.text(formatDate(person.stayTo), 70, 122);
    
    doc.text(`Building:`, 20, 129);
    doc.text(`${person.bedId?.roomId?.buildingId?.name || 'N/A'}`, 70, 129);
    doc.text(`Room:`, 20, 136);
    doc.text(`${person.bedId?.roomId?.roomNumber || 'N/A'}`, 70, 136);
    doc.text(`Bed:`, 20, 143);
    doc.text(`${person.bedId?.name || 'N/A'}`, 70, 143);

    // Line separator
    doc.line(20, 155, 190, 155);

    // Contact
    doc.setFont('helvetica', 'bold');
    doc.text("Contact Information", 20, 165);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booked By:`, 20, 175);
    doc.text(`${person.userId?.name || 'N/A'}`, 70, 175);
    doc.text(`Contact #:`, 20, 182);
    doc.text(`${person.contactNumber || 'N/A'}`, 70, 182);

    const pdfBlob = doc.output('blob');
    const filename = `Occupancy_${person.name.replace(/\s/g, '_')}_${person.bookingNumber}.pdf`;

    self.postMessage({ blob: pdfBlob, filename });
}

// Global error handler for the worker
self.addEventListener('error', function(event) {
    console.error('Unhandled error in worker:', event.message, event);
    self.postMessage({ error: `An unhandled error occurred in the PDF worker: ${event.message}` });
});

