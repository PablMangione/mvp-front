// src/components/admin/subjects/SubjectList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { subjectManagementService } from '../../../services/admin';
import type { SubjectDto } from '../../../types/admin.types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import './SubjectList.css';

/**
 * Componente para la gestión de asignaturas en el panel administrativo.
 *
 * Este componente es el punto de entrada principal para que los administradores
 * gestionen el catálogo de asignaturas del sistema. Proporciona:
 *
 * 1. Visualización completa de todas las asignaturas
 * 2. Búsqueda y filtrado en tiempo real
 * 3. Acciones CRUD (Create, Read, Update, Delete)
 * 4. Feedback visual del estado de las operaciones
 *
 * La decisión de no paginar las asignaturas se basa en que típicamente
 * una institución maneja un número manejable de asignaturas (50-200),
 * lo que hace más práctica una vista completa con filtrado del lado cliente.
 */
export const SubjectList: React.FC = () => {
    const navigate = useNavigate();

    // ========== Estados del componente ==========

    // Lista completa de asignaturas desde el servidor
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);

    // Estados de carga y error para feedback al usuario
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para el filtro por carrera
    const [selectedMajor, setSelectedMajor] = useState<string>('all');

    // Estado para el filtro por año de curso
    const [selectedYear, setSelectedYear] = useState<string>('all');

    // Estado para ordenamiento de la tabla
    const [sortConfig, setSortConfig] = useState<{
        key: keyof SubjectDto;
        direction: 'asc' | 'desc';
    } | null>(null);

    // ========== Estados para el modal de eliminación ==========

    /**
     * Estado para controlar la visibilidad del modal.
     * Separamos la lógica del modal del resto del componente para mejor organización.
     */
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    /**
     * Asignatura seleccionada para eliminar.
     * Guardamos toda la información de la asignatura, no solo el ID,
     * para poder mostrarla en el modal.
     */
    const [subjectToDelete, setSubjectToDelete] = useState<SubjectDto | null>(null);

    // ========== Efectos ==========

    /**
     * Carga inicial de asignaturas.
     * Se ejecuta una sola vez al montar el componente.
     */
    useEffect(() => {
        loadSubjects();
    }, []);

    // ========== Funciones de carga de datos ==========

    /**
     * Carga todas las asignaturas desde el servidor.
     * Maneja estados de carga y errores para dar feedback al usuario.
     */
    const loadSubjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await subjectManagementService.getAllSubjects();
            setSubjects(data);
        } catch (err) {
            console.error('Error al cargar asignaturas:', err);
            setError('No se pudieron cargar las asignaturas. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // ========== Cálculos derivados con useMemo ==========

    /**
     * Extrae las carreras únicas de todas las asignaturas.
     * useMemo evita recalcular esto en cada render.
     */
    const uniqueMajors = useMemo(() => {
        const majors = new Set(subjects.map(subject => subject.major));
        return Array.from(majors).sort();
    }, [subjects]);

    /**
     * Extrae los años de curso únicos.
     * Los años típicamente van del 1 al 5 o 6.
     */
    const uniqueYears = useMemo(() => {
        const years = new Set(subjects.map(subject => subject.courseYear));
        return Array.from(years).sort((a, b) => a - b);
    }, [subjects]);

    /**
     * Aplica filtros y búsqueda a la lista de asignaturas.
     *
     * El proceso de filtrado sigue este orden:
     * 1. Filtro por término de búsqueda (nombre de asignatura)
     * 2. Filtro por carrera seleccionada
     * 3. Filtro por año de curso
     * 4. Ordenamiento según configuración
     */
    const filteredAndSortedSubjects = useMemo(() => {
        let filtered = [...subjects];

        // Aplicar búsqueda por nombre
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(subject =>
                subject.name.toLowerCase().includes(searchLower)
            );
        }

        // Aplicar filtro por carrera
        if (selectedMajor !== 'all') {
            filtered = filtered.filter(subject => subject.major === selectedMajor);
        }

        // Aplicar filtro por año
        if (selectedYear !== 'all') {
            filtered = filtered.filter(subject =>
                subject.courseYear === parseInt(selectedYear)
            );
        }

        // Aplicar ordenamiento si está configurado
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Manejo especial para valores null/undefined
                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                // Comparación según el tipo de dato
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [subjects, searchTerm, selectedMajor, selectedYear, sortConfig]);

    // ========== Manejadores de eventos ==========

    /**
     * Maneja el cambio en el campo de búsqueda.
     * Actualiza el estado inmediatamente para búsqueda en tiempo real.
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    /**
     * Maneja el click en una columna para ordenar.
     * Alterna entre ascendente, descendente y sin orden.
     */
    const handleSort = (key: keyof SubjectDto) => {
        setSortConfig(current => {
            // Si no hay orden actual o es una columna diferente
            if (!current || current.key !== key) {
                return { key, direction: 'asc' };
            }

            // Si ya está ordenando ascendente, cambiar a descendente
            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }

            // Si está descendente, quitar el orden
            return null;
        });
    };

    /**
     * Navega al formulario de creación de nueva asignatura
     */
    const handleCreate = () => {
        navigate('/admin/subjects/new');
    };

    /**
     * Navega al formulario de edición para una asignatura específica
     */
    const handleEdit = (subjectId: number) => {
        navigate(`/admin/subjects/${subjectId}/edit`);
    };

    /**
     * Inicia el proceso de eliminación mostrando el modal de confirmación.
     *
     * En lugar de eliminar directamente, ahora:
     * 1. Guardamos la asignatura seleccionada
     * 2. Abrimos el modal de confirmación
     * 3. El modal se encarga de verificar si se puede eliminar
     * 4. Si el usuario confirma Y se puede eliminar, entonces procedemos
     *
     * Esta separación de responsabilidades hace el código más mantenible
     * y proporciona una mejor experiencia de usuario.
     */
    const handleDelete = (subject: SubjectDto) => {
        setSubjectToDelete(subject);
        setIsDeleteModalOpen(true);
    };

    /**
     * Maneja el cierre del modal sin eliminar.
     * Limpia el estado para evitar referencias a datos obsoletos.
     */
    const handleModalClose = () => {
        setIsDeleteModalOpen(false);
        setSubjectToDelete(null);
    };

    /**
     * Maneja la confirmación de eliminación desde el modal.
     * Esta función se ejecuta solo si el usuario confirma Y el modal
     * verificó que la asignatura puede ser eliminada.
     */
    const handleDeleteConfirm = async () => {
        if (!subjectToDelete) return;

        try {
            await subjectManagementService.deleteSubject(subjectToDelete.id);

            // Cerrar el modal
            handleModalClose();

            // Recargar la lista para reflejar los cambios
            await loadSubjects();

            // Opcional: Podrías mostrar un mensaje de éxito aquí
            // Por ejemplo, usando un toast o una notificación
        } catch (err) {
            // El error ya se maneja en el modal, pero podríamos
            // hacer algo adicional aquí si fuera necesario
            console.error('Error al eliminar asignatura:', err);
            throw err; // Re-lanzamos para que el modal muestre el error
        }
    };

    /**
     * Obtiene el símbolo de ordenamiento para mostrar en los encabezados
     */
    const getSortSymbol = (column: keyof SubjectDto) => {
        if (!sortConfig || sortConfig.key !== column) {
            return ' ↕️'; // Sin orden
        }
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    // ========== Renderizado condicional para estados especiales ==========

    if (loading) {
        return (
            <div className="subject-list__loading">
                <div className="spinner"></div>
                <p>Cargando asignaturas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="subject-list__error">
                <p>❌ {error}</p>
                <button onClick={loadSubjects} className="btn btn--secondary">
                    Reintentar
                </button>
            </div>
        );
    }

    // ========== Renderizado principal ==========

    return (
        <div className="subject-list">
            {/* Encabezado con título y botón de crear */}
            <div className="subject-list__header">
                <h1 className="subject-list__title">Gestión de Asignaturas</h1>
                <button onClick={handleCreate} className="btn btn--primary">
                    ➕ Nueva Asignatura
                </button>
            </div>

            {/* Barra de filtros */}
            <div className="subject-list__filters">
                {/* Campo de búsqueda */}
                <div className="filter-group">
                    <label htmlFor="search" className="filter-label">Buscar:</label>
                    <input
                        id="search"
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre..."
                        className="filter-input"
                    />
                </div>

                {/* Filtro por carrera */}
                <div className="filter-group">
                    <label htmlFor="major-filter" className="filter-label">Carrera:</label>
                    <select
                        id="major-filter"
                        value={selectedMajor}
                        onChange={(e) => setSelectedMajor(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todas las carreras</option>
                        {uniqueMajors.map(major => (
                            <option key={major} value={major}>{major}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por año */}
                <div className="filter-group">
                    <label htmlFor="year-filter" className="filter-label">Año:</label>
                    <select
                        id="year-filter"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los años</option>
                        {uniqueYears.map(year => (
                            <option key={year} value={year}>Año {year}</option>
                        ))}
                    </select>
                </div>

                {/* Contador de resultados */}
                <div className="filter-results">
                    Mostrando {filteredAndSortedSubjects.length} de {subjects.length} asignaturas
                </div>
            </div>

            {/* Tabla de asignaturas */}
            <div className="subject-list__table-container">
                <table className="subject-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')} className="sortable">
                            ID{getSortSymbol('id')}
                        </th>
                        <th onClick={() => handleSort('name')} className="sortable">
                            Nombre{getSortSymbol('name')}
                        </th>
                        <th onClick={() => handleSort('major')} className="sortable">
                            Carrera{getSortSymbol('major')}
                        </th>
                        <th onClick={() => handleSort('courseYear')} className="sortable">
                            Año{getSortSymbol('courseYear')}
                        </th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedSubjects.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="empty-message">
                                No se encontraron asignaturas que coincidan con los filtros
                            </td>
                        </tr>
                    ) : (
                        filteredAndSortedSubjects.map(subject => (
                            <tr key={subject.id}>
                                <td className="text-center">{subject.id}</td>
                                <td>
                                    <Link
                                        to={`/admin/subjects/${subject.id}`}
                                        className="subject-link"
                                    >
                                        {subject.name}
                                    </Link>
                                </td>
                                <td>{subject.major}</td>
                                <td className="text-center">{subject.courseYear}</td>
                                <td className="actions">
                                    <button
                                        onClick={() => handleEdit(subject.id)}
                                        className="btn btn--small btn--secondary"
                                        title="Editar asignatura"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subject)}
                                        className="btn btn--small btn--danger"
                                        title="Eliminar asignatura"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/*
                Modal de confirmación de eliminación.

                Observa cómo conectamos el modal con el componente padre:
                - isOpen: controlado por nuestro estado local
                - onClose: actualiza el estado cuando el usuario cancela
                - onConfirm: ejecuta la lógica de eliminación real
                - subject: pasa la asignatura seleccionada

                El modal es "controlado" - su estado vive en el componente padre.
                Esto nos da control total sobre cuándo aparece y desaparece.
            */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleModalClose}
                onConfirm={handleDeleteConfirm}
                subject={subjectToDelete}
            />
        </div>
    );
};