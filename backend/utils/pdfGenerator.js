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
        const colWidthLeft = 110; // Width for values in left column
        const colWidthRight = 100; // Width for values in right column

        // Helper to print a field and return the height used
        const printField = (label, value, xLabel, xValue, y, width) => {
            doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold');
            doc.text(label, xLabel, y);
            
            doc.fillColor('black').font('Helvetica');
            const options = { width: width, align: 'left' };
            const height = doc.heightOfString(value, options);
            doc.text(value, xValue, y, options);
            
            return Math.max(20, height + 5); // Return height used (min 20px step)
        };

        // --- Left Column ---
        let currentLeftY = infoTop;
        
        currentLeftY += printField('Booked By:', booking.userId.name, leftColX, leftColValueX, currentLeftY, colWidthLeft);
        currentLeftY += printField('Contact:', booking.formData.contactNumber, leftColX, leftColValueX, currentLeftY, colWidthLeft);
        currentLeftY += printField('Ashram:', booking.formData.ashramName, leftColX, leftColValueX, currentLeftY, colWidthLeft);
        currentLeftY += printField('City:', booking.formData.city, leftColX, leftColValueX, currentLeftY, colWidthLeft);

        // --- Right Column ---
        let currentRightY = infoTop;
        
        currentRightY += printField('Booking ID:', booking.bookingNumber, rightColX, rightColValueX, currentRightY, colWidthRight);
        currentRightY += printField('Event:', booking.eventId.name, rightColX, rightColValueX, currentRightY, colWidthRight);
        
        const stayFrom = formatDate(booking.formData.stayFrom);
        const stayTo = formatDate(booking.formData.stayTo);
        
        currentRightY += printField('Stay From:', stayFrom, rightColX, rightColValueX, currentRightY, colWidthRight);
        currentRightY += printField('Stay To:', stayTo, rightColX, rightColValueX, currentRightY, colWidthRight);

        // Determine where to start the next section
        const sectionBottom = Math.max(currentLeftY, currentRightY) + 10;
        
        doc.y = sectionBottom;
        doc.rect(30, doc.y, 360, 1).fill(lightGray).stroke(); // A5 width adjustment
        doc.moveDown(2);

        // Allocation Table
        doc.fillColor(secondaryColor).fontSize(14).font('Helvetica-Bold').text('Accommodation Details', { align: 'center' });
        doc.moveDown();

        const tableTop = doc.y;
        generateTableHeader(doc, tableTop);

        let currentY = tableTop + 25;

        booking.formData.people.forEach((person, index) => {
            const alloc = booking.allocations[index];
            if (alloc) {
                // Calculate dynamic row height for table
                const nameHeight = doc.heightOfString(person.name, { width: 80 });
                const buildHeight = doc.heightOfString(alloc.buildingId.name, { width: 85 });
                const rowHeight = Math.max(20, nameHeight, buildHeight) + 10;

                // Check page break
                if (currentY + rowHeight > 550) { // Approx A5 height limit
                    doc.addPage();
                    generateTableHeader(doc, 30);
                    currentY = 55;
                }

                generateTableRow(doc, currentY, person, alloc, rowHeight);
                currentY += rowHeight;
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
function generateTableRow(doc, y, person, alloc, height) {
    doc.fontSize(9).fillColor('black').font('Helvetica');
    
    // Use width options to allow wrapping
    doc.text(person.name, 35, y, { width: 80 });
    doc.text(person.gender, 120, y, { width: 35 });
    doc.text(alloc.buildingId.name, 160, y, { width: 85 });
    doc.text(alloc.roomId.roomNumber, 250, y, { width: 60 });
    doc.text(alloc.bedId.name, 320, y, { width: 60 });

    // Draw the line below the row based on dynamic height
    doc.rect(30, y + height - 5, 360, 0.5).stroke('#E2E8F0');
}

function generateOccupancyReportPdf(people, filters) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            info: {
                Title: 'Occupancy Report',
                Author: 'Shri Adarsh Dham',
            }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // --- PDF Content ---
        const primaryColor = '#C5306C'; 
        const secondaryColor = '#4A5568';

        // Header
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('Shri Adarsh Dham', { align: 'center' });
        doc.fontSize(14).fillColor(secondaryColor).font('Helvetica').text('Occupancy Report', { align: 'center' });
        doc.moveDown(0.5);

        // Filter Summary
        doc.fontSize(10).fillColor('black').font('Helvetica');
        const filterText = [];
        if (filters.startDate) filterText.push(`From: ${new Date(filters.startDate).toLocaleDateString()}`);
        if (filters.endDate) filterText.push(`To: ${new Date(filters.endDate).toLocaleDateString()}`);
        if (filters.gender) filterText.push(`Gender: ${filters.gender}`);
        // Add more filter summaries if needed
        
        if (filterText.length > 0) {
            doc.text(filterText.join(' | '), { align: 'center' });
        }
        doc.moveDown(1);

        // Table Constants
        const tableTop = doc.y;
        const colX = [40, 140, 180, 220, 290, 360, 420, 480]; // Column X positions
        // Widths: Name, Gen, Age, City, Contact, Building, Room, Bed
        const colWidths = [95, 35, 35, 65, 65, 55, 55, 50]; 
        
        // Header Row
        drawReportTableHeader(doc, doc.y, colX);
        doc.moveDown();
        
        let currentY = doc.y;

        people.forEach((person, index) => {
            // Calculate dynamic row height
            doc.fontSize(9).font('Helvetica');
            const nameH = doc.heightOfString(person.name, { width: colWidths[0] });
            const cityH = doc.heightOfString(person.city, { width: colWidths[3] });
            const buildH = doc.heightOfString(person.buildingName, { width: colWidths[5] });
            
            const rowHeight = Math.max(20, nameH, cityH, buildH) + 10; // +10 padding

            // Check for page break
            if (currentY + rowHeight > 750) {
                doc.addPage();
                drawReportTableHeader(doc, 40, colX); // Re-draw header
                currentY = 65; // Reset Y
            }

            drawReportTableRow(doc, currentY, person, colX, colWidths, rowHeight);
            currentY += rowHeight;
        });

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor(secondaryColor).text(
                `Generated on: ${formatDate(new Date())}`,
                40,
                doc.page.height - 30, 
                { align: 'left' }
            );
        }

        doc.end();
    });
}

function drawReportTableHeader(doc, y, colX) {
    doc.fontSize(9).fillColor('#2D3748').font('Helvetica-Bold');
    doc.rect(40, y - 5, 515, 20).fill('#F7FAFC').stroke('#E2E8F0'); // Header background
    
    doc.fillColor('#2D3748');
    doc.text('Name', colX[0], y);
    doc.text('Gen', colX[1], y);
    doc.text('Age', colX[2], y);
    doc.text('City', colX[3], y);
    doc.text('Contact', colX[4], y);
    doc.text('Building', colX[5], y);
    doc.text('Room', colX[6], y);
    doc.text('Bed', colX[7], y);
}

function drawReportTableRow(doc, y, person, colX, colWidths, height) {
    doc.fontSize(9).fillColor('black').font('Helvetica');
    
    doc.text(person.name, colX[0], y, { width: colWidths[0] });
    doc.text(person.gender || '-', colX[1], y, { width: colWidths[1] });
    doc.text(person.age || '-', colX[2], y, { width: colWidths[2] });
    doc.text(person.city, colX[3], y, { width: colWidths[3] });
    doc.text(person.contactNumber || '-', colX[4], y, { width: colWidths[4] });
    doc.text(person.buildingName, colX[5], y, { width: colWidths[5] });
    doc.text(person.roomNumber || '-', colX[6], y, { width: colWidths[6] });
    doc.text(person.bedName || '-', colX[7], y, { width: colWidths[7] });

    doc.rect(40, y + height - 5, 515, 0.5).stroke('#E2E8F0'); // Row separator
}

module.exports = { generateBookingPdf, generateOccupancyReportPdf };