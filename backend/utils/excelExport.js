const exceljs = require('exceljs');

exports.generateBookingsXlsx = async (bookings) => {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Bookings');

  worksheet.columns = [
    { header: 'Booking ID', key: '_id', width: 30 },
    { header: 'User Name', key: 'userName', width: 30 },
    { header: 'User Phone', key: 'userPhone', width: 15 },
    { header: 'Event Name', key: 'eventName', width: 30 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  bookings.forEach(booking => {
    worksheet.addRow({
      _id: booking._id,
      userName: booking.userId?.name,
      userPhone: booking.userId?.phone,
      eventName: booking.eventId?.name,
      city: booking.formData?.city,
      status: booking.status,
      createdAt: booking.createdAt?.toISOString()
    });
  });

  return workbook.xlsx.writeBuffer();
};