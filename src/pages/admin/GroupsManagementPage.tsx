// src/pages/admin/GroupsManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useGroups, useSubjects, useTeachers } from '../../hooks/admin';
import {
    GroupTable,
    GroupForm,
    GroupStatusModal,
    SearchBar
} from '../../components/admin';
import {
    PageHeader,
    Pagination,
    ConfirmDialog} from '../../components/common';
import type { CourseGroupDto } from '../../types/admin.types';
import './ManagementPage.css';

/**
 * Página de gestión de grupos.
 * Permite crear, editar, eliminar grupos y cambiar su estado.
 */
export const GroupsManagementPage: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const subjectIdFromQuery = queryParams.get('subjectId');

    const {
        groups,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchGroups,
        createGroup,
        updateGroup,
        updateGroupStatus,
        deleteGroup,
        searchGroups,
        getGroupsBySubject
    } = useGroups();

    const { subjects, fetchSubjects } = useSubjects();
    const { teachers, getAvailableTeachers } = useTeachers();

    // Estados locales
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<CourseGroupDto | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<CourseGroupDto | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [groupToChangeStatus, setGroupToChangeStatus] = useState<CourseGroupDto | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<CourseGroupDto[]>([]);
    const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);

    // Cargar datos iniciales
    useEffect(() => {
        // Si hay un subjectId en la query, filtrar por esa asignatura
        if (subjectIdFromQuery) {
            getGroupsBySubject(Number(subjectIdFromQuery));
        } else if (!searchQuery) {
            fetchGroups(0);
        }

        // Cargar asignaturas y profesores para el formulario
        fetchSubjects();
    }, [fetchGroups, fetchSubjects, getGroupsBySubject, subjectIdFromQuery, searchQuery]);

    // Cargar profesores disponibles cuando se abre el formulario
    useEffect(() => {
        if (isFormOpen) {
            getAvailableTeachers().then(setAvailableTeachers);
        }
    }, [isFormOpen, getAvailableTeachers]);

    // Manejadores de búsqueda
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (query.trim()) {
            setIsSearching(true);
            try {
                const results = await searchGroups(query);
                setSearchResults(results);
            } catch (error) {
                console.error('Error en búsqueda:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            if (subjectIdFromQuery) {
                getGroupsBySubject(Number(subjectIdFromQuery));
            } else {
                fetchGroups(0);
            }
        }
    }, [searchGroups, fetchGroups, getGroupsBySubject, subjectIdFromQuery]);

    // Manejadores de formulario
    const handleCreate = () => {
        setSelectedGroup(null);
        setIsFormOpen(true);
    };

    const handleEdit = (group: CourseGroupDto) => {
        setSelectedGroup(group);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedGroup) {
                await updateGroup(selectedGroup.id, data);
            } else {
                await createGroup(data);
            }
            setIsFormOpen(false);
            // Recargar lista
            if (searchQuery) {
                handleSearch(searchQuery);
            } else if (subjectIdFromQuery) {
                getGroupsBySubject(Number(subjectIdFromQuery));
            } else {
                fetchGroups(currentPage);
            }
        } catch (error) {
            // El error se maneja en el hook
        }
    };

    // Manejador de cambio de estado
    const handleChangeStatus = (group: CourseGroupDto) => {
        setGroupToChangeStatus(group);
        setIsStatusModalOpen(true);
    };

    const handleStatusSubmit = async (data: any) => {
        if (groupToChangeStatus) {
            try {
                await updateGroupStatus(groupToChangeStatus.id, data);
                setIsStatusModalOpen(false);
                // Recargar lista
                if (searchQuery) {
                    handleSearch(searchQuery);
                } else {
                    fetchGroups(currentPage);
                }
            } catch (error) {
                // El error se maneja en el hook
            }
        }
    };

    // Manejadores de eliminación
    const handleDeleteClick = (group: CourseGroupDto) => {
        setGroupToDelete(group);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (groupToDelete) {
            try {
                await deleteGroup(groupToDelete.id);
                setIsDeleteDialogOpen(false);
                // Recargar lista
                if (searchQuery) {
                    handleSearch(searchQuery);
                } else {
                    fetchGroups(currentPage);
                }
            } catch (error) {
                // El error se maneja en el hook
            }
        }
    };

    // Manejador de vista
    const handleView = (group: CourseGroupDto) => {
        // TODO: Navegar a página de detalle o abrir modal
        console.log('Ver grupo:', group);
    };

    // Manejador de ver estudiantes
    const handleViewStudents = (group: CourseGroupDto) => {
        // TODO: Abrir modal con lista de estudiantes
        console.log('Ver estudiantes del grupo:', group);
    };

    // Manejador de paginación
    const handlePageChange = (page: number) => {
        fetchGroups(page);
    };

    // Datos a mostrar
    const displayData = searchQuery ? searchResults : groups;

    return (
        <div className="management-page">
            <PageHeader
                title="Gestión de Grupos"
                subtitle={
                    subjectIdFromQuery
                        ? `Grupos de ${subjects.find(s => s.id === Number(subjectIdFromQuery))?.name || 'la asignatura'}`
                        : "Administra los grupos del sistema"
                }
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                    >
                        <span>➕</span> Nuevo Grupo
                    </button>
                }
                breadcrumb={
                    subjectIdFromQuery ? [
                        { label: 'Asignaturas', path: '/admin/subjects' },
                        { label: 'Grupos' }
                    ] : undefined
                }
            />

            <div className="management-toolbar">
                <SearchBar
                    placeholder="Buscar grupos..."
                    onSearch={handleSearch}
                    className="management-search"
                />
                <div className="toolbar-info">
                    {searchQuery ? (
                        <span>
                            {searchResults.length} resultado(s) para "{searchQuery}"
                        </span>
                    ) : (
                        <span>{totalElements} grupo(s) en total</span>
                    )}
                </div>
            </div>

            <div className="management-content">
                <GroupTable
                    groups={displayData}
                    loading={loading || isSearching}
                    error={error}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onChangeStatus={handleChangeStatus}
                    onViewStudents={handleViewStudents}
                />
            </div>

            {!searchQuery && totalPages > 1 && (
                <div className="management-pagination">
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={(page) => handlePageChange(page - 1)}
                    />
                </div>
            )}

            {/* Modal de formulario */}
            <GroupForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                group={selectedGroup}
                subjects={subjects}
                teachers={availableTeachers}
                loading={loading}
            />

            {/* Modal de cambio de estado */}
            <GroupStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onSubmit={handleStatusSubmit}
                group={groupToChangeStatus}
                loading={loading}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Eliminar Grupo"
                message={
                    groupToDelete?.enrolled && groupToDelete.enrolled > 0
                        ? `El grupo ${groupToDelete.groupNumber} tiene ${groupToDelete.enrolled} estudiante(s) inscrito(s). No se puede eliminar.`
                        : `¿Está seguro de eliminar el grupo ${groupToDelete?.groupNumber} de ${groupToDelete?.subject.name}? Esta acción no se puede deshacer.`
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="confirm-dialog__button--danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteDialogOpen(false)}
                isLoading={loading}
            />
        </div>
    );
};