const PDFDocument = require('pdfkit');

function generateBookingPdf(booking) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            info: {
                Title: `Booking Pass - ${booking.bookingNumber}`,
                Author: 'Adarsh Dham',
            }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // --- PDF Content ---

        // Define colors and fonts
        const primaryColor = '#C5306C'; // A pink shade
        const secondaryColor = '#4A5568'; // A dark gray
        const lightGray = '#E2E8F0';

        // Header
        doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Adarsh Dham', { align: 'center' });
        doc.fontSize(16).font('Helvetica').text('Accommodation Pass', { align: 'center' });
        doc.moveDown(2);

        // Booking Info Section
        doc.rect(40, doc.y, 515, 2).fill(lightGray).stroke();
        doc.moveDown();

        const infoTop = doc.y;
        
        // Left Column
        doc.fillColor(secondaryColor).fontSize(11).font('Helvetica-Bold');
        doc.text('Booked By:', 50, infoTop);
        doc.text('Contact:', 50, infoTop + 20);
        doc.text('Ashram:', 50, infoTop + 40);
        doc.text('City:', 50, infoTop + 60);

        doc.fillColor('black').font('Helvetica');
        doc.text(booking.userId.name, 150, infoTop);
        doc.text(booking.formData.contactNumber, 150, infoTop + 20);
        doc.text(booking.formData.ashramName, 150, infoTop + 40);
        doc.text(booking.formData.city, 150, infoTop + 60);

        // Right Column
        doc.fillColor(secondaryColor).font('Helvetica-Bold');
        doc.text('Booking ID:', 320, infoTop);
        doc.text('Event:', 320, infoTop + 20);
        doc.text('Stay From:', 320, infoTop + 40);
        doc.text('Stay To:', 320, infoTop + 60);

        const stayFrom = formatDate(booking.formData.stayFrom);
        const stayTo = formatDate(booking.formData.stayTo);

        doc.fillColor('black').font('Helvetica');
        doc.text(booking.bookingNumber, 420, infoTop);
        doc.text(booking.eventId.name, 420, infoTop + 20);
        doc.text(stayFrom, 420, infoTop + 40);
        doc.text(stayTo, 420, infoTop + 60);
        
        doc.y = infoTop + 80;
        doc.rect(40, doc.y, 515, 2).fill(lightGray).stroke();
        doc.moveDown(2);

        // Allocation Table
        doc.fillColor(secondaryColor).fontSize(14).font('Helvetica-Bold').text('Accommodation Details');
        doc.moveDown();

        const tableTop = doc.y;
        generateTableHeader(doc, tableTop);
        
        let currentY = tableTop + 25;
        
        // CORRECTED LOOP LOGIC
        booking.formData.people.forEach((person, index) => {
            const alloc = booking.allocations[index];
            if (alloc) {
                generateTableRow(doc, currentY, person, alloc);
                currentY += 25;
            }
        });

        // Finalize table
        doc.rect(40, currentY - 5, 515, 0.5).stroke(secondaryColor);
        
        // Footer
        const generatedDate = formatDate(new Date());
        doc.fontSize(8).fillColor(secondaryColor).text(
            'This is a computer-generated pass. Please keep it with you for the duration of your stay. Wishing you a peaceful visit.',
            40, 780, { align: 'center' }
        );
        doc.text(`Generated on: ${generatedDate}`, { align: 'center' });

        doc.end();
    });
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Helper function to draw the table header
function generateTableHeader(doc, y) {
    const headerX = 40;
    const headerY = y;
    const headerHeight = 20;
    const headerWidth = 515;

    doc.rect(headerX, headerY, headerWidth, headerHeight).fill('#F7FAFC').stroke('#E2E8F0');
    doc.fontSize(10).fillColor('#2D3748').font('Helvetica-Bold');
    doc.text('Guest Name', 50, y + 6);
    doc.text('Gender', 160, y + 6);
    doc.text('Building', 240, y + 6);
    doc.text('Room No.', 370, y + 6);
    doc.text('Bed No.', 470, y + 6);
}

// Helper function to draw a single table row
function generateTableRow(doc, y, person, alloc) {
    doc.fontSize(10).fillColor('black').font('Helvetica');
    doc.text(person.name, 50, y);
    doc.text(person.gender, 160, y, { width: 70, align: 'left', lineBreak: false });
    doc.text(alloc.buildingId.name, 240, y, { width: 120, align: 'left', lineBreak: false });
    doc.text(alloc.roomId.roomNumber, 370, y, { width: 90, align: 'left', lineBreak: false });
    doc.text(alloc.bedId.name, 470, y, { width: 70, align: 'left', lineBreak: false });

    // Draw the line below the row
    doc.rect(40, y + 15, 515, 0.5).stroke('#E2E8F0');
}

module.exports = { generateBookingPdf };