// src/pages/admin/TeachersManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTeachers } from '../../hooks/admin';
import {
    TeacherTable,
    TeacherForm,
    SearchBar
} from '../../components/admin';
import {
    PageHeader,
    Pagination,
    ConfirmDialog} from '../../components/common';
import type { TeacherDto } from '../../types/admin.types';
import './ManagementPage.css';

/**
 * Página de gestión de profesores.
 * Permite crear, editar, eliminar y buscar profesores.
 */
export const TeachersManagementPage: React.FC = () => {
    const {
        teachers,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchTeachers,
        createTeacher,
        updateTeacher,
        deleteTeacher,
        searchTeachers
    } = useTeachers();

    // Estados locales
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherDto | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<TeacherDto | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<TeacherDto[]>([]);

    // Cargar profesores al montar
    useEffect(() => {
        if (!searchQuery) {
            fetchTeachers(0);
        }
    }, [fetchTeachers, searchQuery]);

    // Manejadores de búsqueda
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (query.trim()) {
            setIsSearching(true);
            try {
                const results = await searchTeachers(query);
                setSearchResults(results);
            } catch (error) {
                console.error('Error en búsqueda:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            fetchTeachers(0);
        }
    }, [searchTeachers, fetchTeachers]);

    // Manejadores de formulario
    const handleCreate = () => {
        setSelectedTeacher(null);
        setIsFormOpen(true);
    };

    const handleEdit = (teacher: TeacherDto) => {
        setSelectedTeacher(teacher);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedTeacher) {
                await updateTeacher(selectedTeacher.id, data);
            } else {
                await createTeacher(data);
            }
            setIsFormOpen(false);
            // Recargar lista o búsqueda
            if (searchQuery) {
                handleSearch(searchQuery);
            } else {
                fetchTeachers(currentPage);
            }
        } catch (error) {
            // El error se maneja en el hook
        }
    };

    // Manejadores de eliminación
    const handleDeleteClick = (teacher: TeacherDto) => {
        setTeacherToDelete(teacher);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (teacherToDelete) {
            try {
                await deleteTeacher(teacherToDelete.id);
                setIsDeleteDialogOpen(false);
                // Recargar lista
                if (searchQuery) {
                    handleSearch(searchQuery);
                } else {
                    fetchTeachers(currentPage);
                }
            } catch (error) {
                // El error se maneja en el hook
            }
        }
    };

    // Manejador de vista
    const handleView = (teacher: TeacherDto) => {
        // TODO: Navegar a página de detalle o abrir modal
        console.log('Ver profesor:', teacher);
    };

    // Manejador de ver horario
    const handleViewSchedule = (teacher: TeacherDto) => {
        // TODO: Navegar a vista de horario o abrir modal
        console.log('Ver horario de:', teacher);
    };

    // Manejador de paginación
    const handlePageChange = (page: number) => {
        fetchTeachers(page);
    };

    // Datos a mostrar
    const displayData = searchQuery ? searchResults : teachers;

    return (
        <div className="management-page">
            <PageHeader
                title="Gestión de Profesores"
                subtitle="Administra los profesores del sistema"
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                    >
                        <span>➕</span> Nuevo Profesor
                    </button>
                }
            />

            <div className="management-toolbar">
                <SearchBar
                    placeholder="Buscar por nombre o email..."
                    onSearch={handleSearch}
                    className="management-search"
                />
                <div className="toolbar-info">
                    {searchQuery ? (
                        <span>
                            {searchResults.length} resultado(s) para "{searchQuery}"
                        </span>
                    ) : (
                        <span>{totalElements} profesor(es) en total</span>
                    )}
                </div>
            </div>

            <div className="management-content">
                <TeacherTable
                    teachers={displayData}
                    loading={loading || isSearching}
                    error={error}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onViewSchedule={handleViewSchedule}
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
            <TeacherForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                teacher={selectedTeacher}
                loading={loading}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Eliminar Profesor"
                message={
                    teacherToDelete?.groupCount && teacherToDelete.groupCount > 0
                        ? `El profesor ${teacherToDelete.name} tiene ${teacherToDelete.groupCount} grupo(s) asignado(s). Debe reasignar los grupos antes de eliminar.`
                        : `¿Está seguro de eliminar al profesor ${teacherToDelete?.name}? Esta acción no se puede deshacer.`
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