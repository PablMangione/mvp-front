// src/pages/admin/GroupRequestsManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useGroupRequests } from '../../hooks/admin';
import {
    GroupRequestTable,
    GroupRequestModal
} from '../../components/admin';
import {
    PageHeader,
    Pagination
} from '../../components/common';
import type { GroupRequestDto } from '../../types/admin.types';
import './ManagementPage.css';

/**
 * Página de gestión de solicitudes de grupo.
 * Permite ver, aprobar y rechazar solicitudes de estudiantes.
 */
export const GroupRequestsManagementPage: React.FC = () => {
    const {
        requests,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchRequests,
        approveRequest,
        rejectRequest,
        getRequestById
    } = useGroupRequests();

    // Estados locales
    const [selectedRequest, setSelectedRequest] = useState<GroupRequestDto | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | undefined>('PENDIENTE');

    // Cargar solicitudes al montar y cuando cambie el filtro
    useEffect(() => {
        fetchRequests(0, 20, 'createdAt,desc', statusFilter);
    }, [fetchRequests, statusFilter]);

    // Manejador de vista/gestión
    const handleView = async (request: GroupRequestDto) => {
        try {
            // Si la solicitud no tiene todos los detalles, cargarla completa
            const fullRequest = await getRequestById(request.id);
            setSelectedRequest(fullRequest);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error al cargar solicitud:', error);
            setSelectedRequest(request);
            setIsModalOpen(true);
        }
    };

    // Manejadores de aprobación/rechazo desde la tabla
    const handleApproveFromTable = (request: GroupRequestDto) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleRejectFromTable = (request: GroupRequestDto) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    // Manejadores del modal
    const handleModalApprove = async (comment?: string) => {
        if (selectedRequest) {
            await approveRequest(selectedRequest.id, comment);
            setIsModalOpen(false);
            // Recargar lista
            fetchRequests(currentPage, 20, 'createdAt,desc', statusFilter);
        }
    };

    const handleModalReject = async (reason: string) => {
        if (selectedRequest) {
            await rejectRequest(selectedRequest.id, reason);
            setIsModalOpen(false);
            // Recargar lista
            fetchRequests(currentPage, 20, 'createdAt,desc', statusFilter);
        }
    };

    // Manejador de paginación
    const handlePageChange = (page: number) => {
        fetchRequests(page - 1, 20, 'createdAt,desc', statusFilter);
    };

    // Estadísticas rápidas
    const pendingCount = requests.filter(r => r.status === 'PENDIENTE').length;

    return (
        <div className="management-page">
            <PageHeader
                title="Gestión de Solicitudes de Grupo"
                subtitle={
                    pendingCount > 0
                        ? `${pendingCount} solicitud(es) pendiente(s) de revisión`
                        : "Todas las solicitudes han sido procesadas"
                }
                actions={
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${statusFilter === 'PENDIENTE' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('PENDIENTE')}
                        >
                            Pendientes
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'APROBADA' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('APROBADA')}
                        >
                            Aprobadas
                        </button>
                        <button
                            className={`filter-btn ${statusFilter === 'RECHAZADA' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('RECHAZADA')}
                        >
                            Rechazadas
                        </button>
                        <button
                            className={`filter-btn ${!statusFilter ? 'active' : ''}`}
                            onClick={() => setStatusFilter(undefined)}
                        >
                            Todas
                        </button>
                    </div>
                }
            />

            <div className="management-content">
                <GroupRequestTable
                    requests={requests}
                    loading={loading}
                    error={error}
                    onView={handleView}
                    onApprove={handleApproveFromTable}
                    onReject={handleRejectFromTable}
                />
            </div>

            {totalPages > 1 && (
                <div className="management-pagination">
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Modal de gestión de solicitud */}
            <GroupRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApprove={handleModalApprove}
                onReject={handleModalReject}
                request={selectedRequest}
                loading={loading}
            />
        </div>
    );
};