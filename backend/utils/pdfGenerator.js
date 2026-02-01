const PDFDocument = require('pdfkit');

function generateBookingPdf(booking) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A5', // Changed to A5
            margin: 30, // Reduced margin for smaller page
            info: {
                Title: `Booking Pass - ${booking.bookingNumber}`,
                Author: 'Shri Adarsh Dham',
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
        doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Shri Adarsh Dham', { align: 'center' });
        doc.fontSize(16).font('Helvetica').text('Accommodation Pass', { align: 'center' });
        doc.moveDown(2);

        // Booking Info Section
        doc.rect(30, doc.y, 360, 1).fill(lightGray).stroke();
        doc.moveDown();

        const infoTop = doc.y;

        // Re-defining layout for A5
        const leftColX = 40;
        const leftColValueX = 110;
        const rightColX = 230;
        const rightColValueX = 300;

        // Let's rewrite the Booking Info Section content placement
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold');
        doc.text('Booked By:', leftColX, infoTop);
        doc.text('Contact:', leftColX, infoTop + 20);
        doc.text('Ashram:', leftColX, infoTop + 40);
        doc.text('City:', leftColX, infoTop + 60);

        doc.fillColor('black').font('Helvetica');
        doc.text(booking.userId.name, leftColValueX, infoTop, { width: 110 });
        doc.text(booking.formData.contactNumber, leftColValueX, infoTop + 20);
        doc.text(booking.formData.ashramName, leftColValueX, infoTop + 40);
        doc.text(booking.formData.city, leftColValueX, infoTop + 60);

        // Right Column
        doc.fillColor(secondaryColor).font('Helvetica-Bold');
        doc.text('Booking ID:', rightColX, infoTop);
        doc.text('Event:', rightColX, infoTop + 20);

        // Add extra spacing for Event logic
        const eventName = booking.eventId.name;
        const eventY = infoTop + 20;
        doc.fillColor('black').font('Helvetica');

        // Print Booking ID
        doc.text(booking.bookingNumber, rightColValueX, infoTop);

        // Print Event with potential wrap and extra spacing below
        doc.text(eventName, rightColValueX, eventY, { width: 100 });

        // Calculate where the event text ended
        const eventHeight = doc.heightOfString(eventName, { width: 100 });
        const nextY = eventY + Math.max(20, eventHeight + 10); // Ensure at least 20px step, or more if multiline + 10px buffer

        // Continue with dates
        const stayFrom = formatDate(booking.formData.stayFrom);
        const stayTo = formatDate(booking.formData.stayTo);

        doc.fillColor(secondaryColor).font('Helvetica-Bold');
        doc.text('Stay From:', rightColX, nextY);
        doc.text('Stay To:', rightColX, nextY + 20);

        doc.fillColor('black').font('Helvetica');
        doc.text(stayFrom, rightColValueX, nextY);
        doc.text(stayTo, rightColValueX, nextY + 20);

        doc.y = nextY + 40; // Spacing after section
        doc.rect(30, doc.y, 360, 1).fill(lightGray).stroke(); // A5 width adjustment
        doc.moveDown(2);

        // Allocation Table
        doc.fillColor(secondaryColor).fontSize(14).font('Helvetica-Bold').text('Accommodation Details');
        doc.moveDown();

        const tableTop = doc.y;
        generateTableHeader(doc, tableTop);

        let currentY = tableTop + 25;

        booking.formData.people.forEach((person, index) => {
            const alloc = booking.allocations[index];
            if (alloc) {
                generateTableRow(doc, currentY, person, alloc);
                currentY += 25;
            }
        });

        // Finalize table
        doc.rect(30, currentY - 5, 360, 0.5).stroke(secondaryColor);

        // Footer
        const generatedDate = formatDate(new Date());
        doc.fontSize(8).fillColor(secondaryColor).text(
            'This is a computer-generated pass. Please keep it with you for the duration of your stay. Wishing you a peaceful visit.',
            30, 520, { align: 'center', width: 360 } // Adjusted Y coordinate for A5 height (approx 595 - padding)
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
    const headerX = 30; // Reduced X
    const headerWidth = 360; // A5 printable width
    const headerHeight = 20;

    doc.rect(headerX, y, headerWidth, headerHeight).fill('#F7FAFC').stroke('#E2E8F0');
    doc.fontSize(9).fillColor('#2D3748').font('Helvetica-Bold'); // Smaller font
    doc.text('Name', 35, y + 6);
    doc.text('Gen', 120, y + 6);
    doc.text('Build', 160, y + 6);
    doc.text('Room', 250, y + 6);
    doc.text('Bed', 320, y + 6);
}

// Helper function to draw a single table row
function generateTableRow(doc, y, person, alloc) {
    doc.fontSize(9).fillColor('black').font('Helvetica');
    doc.text(person.name, 35, y, { width: 80 });
    doc.text(person.gender, 120, y, { width: 35 });
    doc.text(alloc.buildingId.name, 160, y, { width: 85 });
    doc.text(alloc.roomId.roomNumber, 250, y, { width: 60 });
    doc.text(alloc.bedId.name, 320, y, { width: 60 });

    // Draw the line below the row
    doc.rect(30, y + 15, 360, 0.5).stroke('#E2E8F0');
}

module.exports = { generateBookingPdf };