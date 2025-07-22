// src/routes/AdminRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common';
import { AdminLayout } from '../layouts/AdminLayout';
import {
    AdminDashboard,
    StudentsManagementPage,
    TeachersManagementPage,
    SubjectsManagementPage,
    GroupsManagementPage,
    GroupRequestsManagementPage
} from '../pages/admin';

/**
 * Rutas del panel de administración.
 * Todas las rutas requieren autenticación con rol ADMIN.
 */
export const AdminRoutes: React.FC = () => {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Routes>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="students" element={<StudentsManagementPage />} />
                    <Route path="teachers" element={<TeachersManagementPage />} />
                    <Route path="subjects" element={<SubjectsManagementPage />} />
                    <Route path="groups" element={<GroupsManagementPage />} />
                    <Route path="requests" element={<GroupRequestsManagementPage />} />

                    {/* Ruta para acciones específicas (futuro) */}
                    <Route path="students/new" element={<Navigate to="/admin/students" />} />
                    <Route path="teachers/new" element={<Navigate to="/admin/teachers" />} />
                    <Route path="subjects/new" element={<Navigate to="/admin/subjects" />} />
                    <Route path="groups/new" element={<Navigate to="/admin/groups" />} />

                    {/* Ruta 404 dentro de admin */}
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Route>
            </Routes>
        </ProtectedRoute>
    );
};