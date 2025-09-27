import React from 'react';
import { Routes, Route } from 'react-router-dom';
// The bundler struggles with relative paths like '../components/admin/Component.jsx'
// Often, removing the file extension can help resolve imports in environments that support it, 
// or simplifying the path structure if the build tool is expecting a standard configuration.
// Since we cannot change the component hierarchy, we will proceed assuming standard React environment rules apply.

import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import ManageAdmins from '../components/admin/ManageAdmins';
import ManageEvents from '../components/admin/ManageEvents';
import ManageBuildings from '../components/admin/ManageBuildings';
import ManageRooms from '../components/admin/ManageRooms';
import ManageBeds from '../components/admin/ManageBeds';
import ManageAllocations from '../components/admin/ManageAllocations';
import ManageSatsang from '../components/admin/ManageSatsang';
import ExportData from '../components/admin/ExportData';
import SendNotification from '../components/admin/SendNotification';
import AdminUserManagement from '../components/admin/AdminUserManagement'; 

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
        {/* ADDED NEW ROUTE FOR USER MANAGEMENT */}
        <Route path="user-management" element={<AdminUserManagement />} /> 
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
