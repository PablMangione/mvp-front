// src/pages/admin/SubjectsManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../../hooks/admin';
import {
    SubjectTable,
    SubjectForm,
    SearchBar
} from '../../components/admin';
import {
    PageHeader,
    Pagination,
    ConfirmDialog} from '../../components/common';
import type { SubjectDto } from '../../types/admin.types';
import './ManagementPage.css';

/**
 * Página de gestión de asignaturas.
 * Permite crear, editar, eliminar y buscar asignaturas.
 */
export const SubjectsManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        subjects,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchSubjects,
        createSubject,
        updateSubject,
        deleteSubject,
        searchSubjects
    } = useSubjects();

    // Estados locales
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<SubjectDto | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SubjectDto[]>([]);

    // Cargar asignaturas al montar
    useEffect(() => {
        if (!searchQuery) {
            fetchSubjects(0);
        }
    }, [fetchSubjects, searchQuery]);

    // Manejadores de búsqueda
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (query.trim()) {
            setIsSearching(true);
            try {
                const results = await searchSubjects(query);
                setSearchResults(results);
            } catch (error) {
                console.error('Error en búsqueda:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            fetchSubjects(0);
        }
    }, [searchSubjects, fetchSubjects]);

    // Manejadores de formulario
    const handleCreate = () => {
        setSelectedSubject(null);
        setIsFormOpen(true);
    };

    const handleEdit = (subject: SubjectDto) => {
        setSelectedSubject(subject);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedSubject) {
                await updateSubject(selectedSubject.id, data);
            } else {
                await createSubject(data);
            }
            setIsFormOpen(false);
            // Recargar lista o búsqueda
            if (searchQuery) {
                handleSearch(searchQuery);
            } else {
                fetchSubjects(currentPage);
            }
        } catch (error) {
            // El error se maneja en el hook
        }
    };

    // Manejadores de eliminación
    const handleDeleteClick = (subject: SubjectDto) => {
        setSubjectToDelete(subject);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (subjectToDelete) {
            try {
                await deleteSubject(subjectToDelete.id);
                setIsDeleteDialogOpen(false);
                // Recargar lista
                if (searchQuery) {
                    handleSearch(searchQuery);
                } else {
                    fetchSubjects(currentPage);
                }
            } catch (error) {
                // El error se maneja en el hook
            }
        }
    };

    // Manejador de vista
    const handleView = (subject: SubjectDto) => {
        // TODO: Navegar a página de detalle o abrir modal
        console.log('Ver asignatura:', subject);
    };

    // Manejador de gestión de grupos
    const handleManageGroups = (subject: SubjectDto) => {
        // Navegar a la página de grupos con filtro por asignatura
        navigate(`/admin/groups?subjectId=${subject.id}`);
    };

    // Manejador de paginación
    const handlePageChange = (page: number) => {
        fetchSubjects(page);
    };

    // Datos a mostrar
    const displayData = searchQuery ? searchResults : subjects;

    return (
        <div className="management-page">
            <PageHeader
                title="Gestión de Asignaturas"
                subtitle="Administra las asignaturas del sistema"
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                    >
                        <span>➕</span> Nueva Asignatura
                    </button>
                }
            />

            <div className="management-toolbar">
                <SearchBar
                    placeholder="Buscar por código o nombre..."
                    onSearch={handleSearch}
                    className="management-search"
                />
                <div className="toolbar-info">
                    {searchQuery ? (
                        <span>
                            {searchResults.length} resultado(s) para "{searchQuery}"
                        </span>
                    ) : (
                        <span>{totalElements} asignatura(s) en total</span>
                    )}
                </div>
            </div>

            <div className="management-content">
                <SubjectTable
                    subjects={displayData}
                    loading={loading || isSearching}
                    error={error}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onManageGroups={handleManageGroups}
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
            <SubjectForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                subject={selectedSubject}
                loading={loading}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Eliminar Asignatura"
                message={
                    subjectToDelete?.groupCount && subjectToDelete.groupCount > 0
                        ? `La asignatura ${subjectToDelete.name} tiene ${subjectToDelete.groupCount} grupo(s) asociado(s). Debe eliminar los grupos antes de eliminar la asignatura.`
                        : `¿Está seguro de eliminar la asignatura ${subjectToDelete?.name}? Esta acción no se puede deshacer.`
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