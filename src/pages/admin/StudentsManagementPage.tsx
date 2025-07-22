// src/pages/admin/StudentsManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useStudents } from '../../hooks/admin';
import {
    StudentTable,
    StudentForm,
    SearchBar
} from '../../components/admin';
import {
    PageHeader,
    Pagination,
    ConfirmDialog} from '../../components/common';
import type { StudentDto } from '../../types/admin.types';
import './ManagementPage.css';

/**
 * Página de gestión de estudiantes.
 * Permite crear, editar, eliminar y buscar estudiantes.
 */
export const StudentsManagementPage: React.FC = () => {
    const {
        students,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        searchStudents
    } = useStudents();

    // Estados locales
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<StudentDto | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<StudentDto[]>([]);

    // Cargar estudiantes al montar
    useEffect(() => {
        if (!searchQuery) {
            fetchStudents(0);
        }
    }, [fetchStudents, searchQuery]);

    // Manejadores de búsqueda
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);

        if (query.trim()) {
            setIsSearching(true);
            try {
                const results = await searchStudents(query);
                setSearchResults(results);
            } catch (error) {
                console.error('Error en búsqueda:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            fetchStudents(0);
        }
    }, [searchStudents, fetchStudents]);

    // Manejadores de formulario
    const handleCreate = () => {
        setSelectedStudent(null);
        setIsFormOpen(true);
    };

    const handleEdit = (student: StudentDto) => {
        setSelectedStudent(student);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedStudent) {
                await updateStudent(selectedStudent.id, data);
            } else {
                await createStudent(data);
            }
            setIsFormOpen(false);
            // Recargar lista o búsqueda
            if (searchQuery) {
                handleSearch(searchQuery);
            } else {
                fetchStudents(currentPage);
            }
        } catch (error) {
            // El error se maneja en el hook
        }
    };

    // Manejadores de eliminación
    const handleDeleteClick = (student: StudentDto) => {
        setStudentToDelete(student);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (studentToDelete) {
            try {
                await deleteStudent(studentToDelete.id);
                setIsDeleteDialogOpen(false);
                // Recargar lista
                if (searchQuery) {
                    handleSearch(searchQuery);
                } else {
                    fetchStudents(currentPage);
                }
            } catch (error) {
                // El error se maneja en el hook
            }
        }
    };

    // Manejador de vista (podría navegar a detalle)
    const handleView = (student: StudentDto) => {
        // TODO: Navegar a página de detalle o abrir modal
        console.log('Ver estudiante:', student);
    };

    // Manejador de paginación
    const handlePageChange = (page: number) => {
        fetchStudents(page);
    };

    // Datos a mostrar (búsqueda o lista paginada)
    const displayData = searchQuery ? searchResults : students;

    return (
        <div className="management-page">
            <PageHeader
                title="Gestión de Estudiantes"
                subtitle="Administra los estudiantes del sistema"
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                    >
                        <span>➕</span> Nuevo Estudiante
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
                        <span>{totalElements} estudiante(s) en total</span>
                    )}
                </div>
            </div>

            <div className="management-content">
                <StudentTable
                    students={displayData}
                    loading={loading || isSearching}
                    error={error}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
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
            <StudentForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                student={selectedStudent}
                loading={loading}
            />

            {/* Diálogo de confirmación */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                title="Eliminar Estudiante"
                message={`¿Está seguro de eliminar al estudiante ${studentToDelete?.name}? Esta acción no se puede deshacer.`}
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