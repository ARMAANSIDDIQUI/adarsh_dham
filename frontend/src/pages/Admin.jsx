import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import AdminDashboard from '../components/admin/AdminDashboard.jsx';
import ManageAdmins from '../components/admin/ManageAdmins.jsx';
import ManageEvents from '../components/admin/ManageEvents.jsx';
import ManageBuildings from '../components/admin/ManageBuildings.jsx';
import ManageRooms from '../components/admin/ManageRooms.jsx';
import ManageBeds from '../components/admin/ManageBeds.jsx';
import ManageAllocations from '../components/admin/ManageAllocations.jsx';
import ManageSatsang from '../components/admin/ManageSatsang.jsx';
import ExportData from '../components/admin/ExportData.jsx';
import SendNotification from '../components/admin/SendNotification.jsx';

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="manage-admins" element={<ManageAdmins />} />
        <Route path="manage-events" element={<ManageEvents />} />
        <Route path="manage-buildings" element={<ManageBuildings />} />
        <Route path="manage-rooms" element={<ManageRooms />} />
        <Route path="manage-beds" element={<ManageBeds />} />
        <Route path="manage-allocations" element={<ManageAllocations />} />
        <Route path="manage-satsang" element={<ManageSatsang />} />
        <Route path="export-data" element={<ExportData />} />
        <Route path="send-notification" element={<SendNotification />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;