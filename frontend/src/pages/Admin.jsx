import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
import OccupancyReport from '../components/admin/OccupancyReport';
import StructureView from '../components/admin/StructureView'; 
import ManageComments from '../components/admin/ManageComments';
import PasswordResetRequests from '../components/admin/PasswordResetRequests'; // ✨ NEW

const Admin = () => {
    return (
        <AdminLayout>
            <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="manage-admins" element={<ManageAdmins />} />
                <Route path="user-management" element={<AdminUserManagement />} />
                <Route path="password-requests" element={<PasswordResetRequests />} /> {/* ✨ NEW */}
                <Route path="manage-comments" element={<ManageComments />} />
                <Route path="manage-events" element={<ManageEvents />} />
                <Route path="manage-buildings" element={<ManageBuildings />} />
                <Route path="manage-rooms" element={<ManageRooms />} />
                <Route path="structure-view" element={<StructureView />} />
                <Route path="manage-beds" element={<ManageBeds />} />
                <Route path="manage-allocations" element={<ManageAllocations />} />
                <Route path="occupancy-report" element={<OccupancyReport />} />
                <Route path="manage-satsang" element={<ManageSatsang />} />
                <Route path="export-data" element={<ExportData />} />
                <Route path="send-notification" element={<SendNotification />} />
            </Routes>
        </AdminLayout>
    );
};

export default Admin;
