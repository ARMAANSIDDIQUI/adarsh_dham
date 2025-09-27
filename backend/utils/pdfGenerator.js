const PDFDocument = require('pdfkit');

function generateBookingPdf(booking) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Booking Pass - ${booking.bookingNumber}`,
                Author: 'Adarsh Dham',
            }
        });

        // Buffer to store the PDF data
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);

        // --- PDF Content Generation ---

        // Header Section
        // You can add a logo here. Place your logo image in a folder (e.g., /assets)
        // doc.image('path/to/your/logo.png', 50, 45, { width: 50 });
        doc.font('Helvetica-Bold').fontSize(20).text('Booking Confirmation Pass', { align: 'center' });
        doc.moveDown();

        // Booking Info
        doc.fontSize(14).text(`Booking ID: ${booking.bookingNumber}`, { align: 'right' });
        doc.fontSize(14).text(`Event: ${booking.eventId.name}`, { align: 'right' });
        doc.moveDown(2);

        // User Details
        doc.font('Helvetica-Bold').fontSize(12).text('Guest Information');
        doc.font('Helvetica').fontSize(11);
        doc.text(`Name: ${booking.userId.name}`);
        doc.text(`Contact: ${booking.formData.contactNumber}`);
        doc.text(`From: ${booking.formData.city}, ${booking.formData.address}`);
        doc.moveDown();

        // Stay Details
        const stayFrom = new Date(booking.formData.stayFrom).toLocaleDateString('en-GB');
        const stayTo = new Date(booking.formData.stayTo).toLocaleDateString('en-GB');
        doc.font('Helvetica-Bold').fontSize(12).text('Stay Details');
        doc.font('Helvetica').fontSize(11);
        doc.text(`Check-in Date: ${stayFrom}`);
        doc.text(`Check-out Date: ${stayTo}`);
        doc.moveDown(2);

        // Allocation Table
        doc.font('Helvetica-Bold').fontSize(12).text('Accommodation Details');
        doc.moveDown();

        const tableTop = doc.y;
        const itemX = 50;
        const nameX = 50;
        const genderX = 150;
        const buildingX = 220;
        const roomX = 350;
        const bedX = 450;
        
        // Table Header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Guest Name', nameX, tableTop);
        doc.text('Gender', genderX, tableTop);
        doc.text('Building', buildingX, tableTop);
        doc.text('Room No.', roomX, tableTop);
        doc.text('Bed No.', bedX, tableTop);
        
        const tableHeaderY = tableTop + 15;
        doc.moveTo(itemX, tableHeaderY).lineTo(550, tableHeaderY).stroke();

        // Table Rows
        let currentY = tableHeaderY + 5;
        doc.fontSize(10).font('Helvetica');

        booking.allocations.forEach(alloc => {
            const person = booking.formData.people[alloc.personIndex];
            if (person) {
                doc.text(person.name, nameX, currentY);
                doc.text(person.gender, genderX, currentY, { capitalize: true });
                doc.text(alloc.buildingId.name, buildingX, currentY);
                doc.text(alloc.roomId.roomNumber, roomX, currentY);
                doc.text(alloc.bedId.name, bedX, currentY);
                currentY += 20;
            }
        });
        
        doc.moveTo(itemX, currentY).lineTo(550, currentY).stroke();
        doc.moveDown(4);

        // Footer
        const generatedDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        doc.fontSize(8).text(
            'This is a computer-generated pass. Please keep it with you for the duration of your stay.', 
            50, 750, { align: 'center', lineBreak: false }
        );
        doc.fontSize(8).text(`Generated on: ${generatedDate}`, { align: 'center' });
        
        // Finalize the PDF and end the stream
        doc.end();
    });
}

module.exports = { generateBookingPdf };