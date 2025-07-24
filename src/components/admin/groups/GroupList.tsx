// src/components/admin/groups/GroupList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupManagementService } from '../../../services/admin';
import type { CourseGroupDto } from '../../../types/admin.types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import './GroupList.css';

/**
 * Componente para la gestión de grupos en el panel administrativo.
 *
 * Este componente es el punto de entrada principal para que los administradores
 * gestionen los grupos de curso del sistema. Proporciona:
 *
 * 1. Visualización completa de todos los grupos
 * 2. Búsqueda y filtrado avanzado
 * 3. Ordenamiento de columnas
 * 4. Información clave: asignatura, profesor, estado, capacidad
 * 5. Acciones CRUD con confirmación de eliminación
 * 6. Feedback visual del estado de las operaciones
 *
 * Los grupos son la unidad fundamental donde ocurre la enseñanza,
 * por lo que su correcta gestión es crítica para el funcionamiento
 * del sistema académico.
 *
 * La información de enrolledStudents se calcula dinámicamente en el
 * backend contando las inscripciones reales en cada grupo.
 */
export const GroupList: React.FC = () => {
    const navigate = useNavigate();

    // ========== Estados del componente ==========

    // Lista completa de grupos desde el servidor
    const [groups, setGroups] = useState<CourseGroupDto[]>([]);

    // Estados de carga y error para feedback al usuario
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para mensaje de éxito
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ========== Estados para búsqueda y filtros ==========

    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para el filtro por estado
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Estado para el filtro por tipo
    const [selectedType, setSelectedType] = useState<string>('all');

    // Estado para el filtro por asignatura
    const [selectedSubject, setSelectedSubject] = useState<string>('all');

    // Estado para el filtro por profesor
    const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

    // Estado para ordenamiento de la tabla
    const [sortConfig, setSortConfig] = useState<{
        key: keyof CourseGroupDto;
        direction: 'asc' | 'desc';
    } | null>(null);

    // ========== Estados para el modal de eliminación ==========

    /**
     * Estado para controlar la visibilidad del modal.
     */
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    /**
     * Grupo seleccionado para eliminar.
     * Guardamos toda la información del grupo para mostrarla en el modal.
     */
    const [groupToDelete, setGroupToDelete] = useState<CourseGroupDto | null>(null);

    /**
     * Estado de carga durante la eliminación.
     */
    const [isDeleting, setIsDeleting] = useState(false);

    /**
     * Error durante la eliminación.
     */
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // ========== Efectos ==========

    /**
     * Carga inicial de grupos.
     * Se ejecuta una sola vez al montar el componente.
     */
    useEffect(() => {
        loadGroups();
    }, []);

    // ========== Funciones de carga de datos ==========

    /**
     * Carga todos los grupos desde el servidor.
     * Usa el endpoint real que devuelve todos los grupos con enrolledStudents calculado.
     */
    const loadGroups = async () => {
        try {
            setLoading(true);
            setError(null);

            // Llamada real al servicio
            const data = await groupManagementService.getAllGroups();
            setGroups(data);

        } catch (err) {
            console.error('Error al cargar grupos:', err);
            setError('No se pudieron cargar los grupos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // ========== Funciones de utilidad ==========

    /**
     * Obtiene valores únicos para los filtros.
     * Extrae listas de asignaturas, profesores, etc. de los grupos cargados.
     */
    const filterOptions = useMemo(() => {
        const subjects = new Set<string>();
        const teachers = new Set<string>();

        groups.forEach(group => {
            subjects.add(group.subjectName);
            // Manejar casos donde no hay profesor asignado
            const teacherDisplay = group.teacherName || 'Sin asignar';
            if (group.teacherId && teacherDisplay !== 'Sin asignar') {
                teachers.add(teacherDisplay);
            }
        });

        return {
            subjects: Array.from(subjects).sort(),
            teachers: Array.from(teachers).sort()
        };
    }, [groups]);

    /**
     * Filtra y ordena los grupos según los criterios seleccionados.
     */
    const processedGroups = useMemo(() => {
        let filtered = [...groups];

        // Aplicar búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(group => {
                const teacherDisplay = (group.teacherName || 'Sin asignar').toLowerCase();
                return group.subjectName.toLowerCase().includes(search) ||
                    teacherDisplay.includes(search) ||
                    group.id.toString().includes(search);
            });
        }

        // Aplicar filtro por estado
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(group => group.status === selectedStatus);
        }

        // Aplicar filtro por tipo
        if (selectedType !== 'all') {
            filtered = filtered.filter(group => group.type === selectedType);
        }

        // Aplicar filtro por asignatura
        if (selectedSubject !== 'all') {
            filtered = filtered.filter(group => group.subjectName === selectedSubject);
        }

        // Aplicar filtro por profesor
        if (selectedTeacher !== 'all') {
            filtered = filtered.filter(group => {
                const teacherDisplay = group.teacherName || 'Sin asignar';
                return teacherDisplay === selectedTeacher;
            });
        }

        // Aplicar ordenamiento
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

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
    }, [groups, searchTerm, selectedStatus, selectedType, selectedSubject, selectedTeacher, sortConfig]);

    /**
     * Maneja el ordenamiento de columnas.
     * Alterna entre ascendente, descendente y sin orden.
     */
    const handleSort = (key: keyof CourseGroupDto) => {
        // Limpiar mensajes al interactuar
        setSuccessMessage(null);

        let direction: 'asc' | 'desc' | null = 'asc';

        if (sortConfig && sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else {
                direction = null;
            }
        }

        setSortConfig(direction ? { key, direction } : null);
    };

    /**
     * Resetea todos los filtros a su estado inicial.
     */
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedSubject('all');
        setSelectedTeacher('all');
        setSortConfig(null);
    };

    // ========== Funciones para manejo del modal de eliminación ==========

    /**
     * Abre el modal de confirmación para eliminar un grupo.
     * Verifica primero si el grupo puede ser eliminado.
     */
    const handleDeleteClick = (group: CourseGroupDto) => {
        // Verificar si el grupo puede ser eliminado
        if (group.status !== 'PLANNED') {
            alert('Solo se pueden eliminar grupos en estado PLANIFICADO');
            return;
        }

        if ((group.enrolledStudents || 0) > 0) {
            alert('No se pueden eliminar grupos con estudiantes inscritos');
            return;
        }

        setGroupToDelete(group);
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    /**
     * Confirma y ejecuta la eliminación del grupo.
     */
    const handleDeleteConfirm = async () => {
        if (!groupToDelete) return;

        try {
            setIsDeleting(true);
            setDeleteError(null);

            // Llamar al servicio para eliminar el grupo
            await groupManagementService.deleteGroup(groupToDelete.id);

            // Actualizar la lista local removiendo el grupo eliminado
            setGroups(prevGroups =>
                prevGroups.filter(group => group.id !== groupToDelete.id)
            );

            // Cerrar el modal
            setIsDeleteModalOpen(false);
            setGroupToDelete(null);

            // Mostrar mensaje de éxito
            setSuccessMessage(`El grupo "${groupToDelete.subjectName}" ha sido eliminado exitosamente`);

            // Limpiar el mensaje después de 5 segundos
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

        } catch (error) {
            console.error('Error al eliminar el grupo:', error);
            setDeleteError(
                'No se pudo eliminar el grupo. Por favor, verifica que no tenga estudiantes inscritos y vuelve a intentarlo.'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    /**
     * Cierra el modal de eliminación.
     */
    const handleDeleteCancel = () => {
        if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setGroupToDelete(null);
            setDeleteError(null);
        }
    };

    /**
     * Formatea el estado del grupo para mostrar.
     * Convierte los valores enum en texto legible en español.
     */
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { text: string; className: string }> = {
            'PLANNED': { text: 'Planificado', className: 'status-badge status-badge--planned' },
            'ACTIVE': { text: 'Activo', className: 'status-badge status-badge--active' },
            'CLOSED': { text: 'Cerrado', className: 'status-badge status-badge--closed' }
        };

        const statusInfo = statusMap[status] || {
            text: status,
            className: 'status-badge status-badge--default'
        };

        return (
            <span className={statusInfo.className}>
                {statusInfo.text}
            </span>
        );
    };

    /**
     * Formatea el tipo de grupo.
     */
    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { text: string; className: string }> = {
            'REGULAR': { text: 'Regular', className: 'type-badge type-badge--regular' },
            'INTENSIVE': { text: 'Intensivo', className: 'type-badge type-badge--intensive' }
        };

        const typeInfo = typeMap[type] || {
            text: type,
            className: 'type-badge type-badge--default'
        };

        return (
            <span className={typeInfo.className}>
                {typeInfo.text}
            </span>
        );
    };

    /**
     * Calcula el porcentaje de ocupación del grupo.
     */
    const getOccupancyInfo = (enrolled: number, max: number) => {
        const safeEnrolled = enrolled || 0;
        const safeMax = max || 1; // Evitar división por cero
        const percentage = Math.round((safeEnrolled / safeMax) * 100);
        let className = 'occupancy-bar__fill';

        if (percentage >= 90) {
            className += ' occupancy-bar__fill--full';
        } else if (percentage >= 70) {
            className += ' occupancy-bar__fill--high';
        } else if (percentage >= 50) {
            className += ' occupancy-bar__fill--medium';
        } else {
            className += ' occupancy-bar__fill--low';
        }

        return { percentage, className };
    };

    // ========== Renderizado ==========

    // Estado de carga
    if (loading) {
        return (
            <div className="group-list">
                <div className="group-list__loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando grupos...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="group-list">
                <div className="group-list__error">
                    <p>{error}</p>
                    <button
                        onClick={loadGroups}
                        className="btn btn--primary"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group-list">
            {/* Header con título y acciones */}
            <div className="group-list__header">
                <div className="group-list__header-content">
                    <h1 className="group-list__title">Gestión de Grupos</h1>
                    <p className="group-list__subtitle">
                        Administra los grupos de curso del sistema
                    </p>
                </div>
                <div className="group-list__header-actions">
                    <button
                        onClick={() => navigate('/admin/groups/new')}
                        className="btn btn--primary"
                    >
                        <span className="btn__icon">+</span>
                        Nuevo Grupo
                    </button>
                </div>
            </div>

            {/* Mensajes de feedback */}
            {successMessage && (
                <div className="group-list__success-message">
                    <span className="success-icon">✅</span>
                    <span>{successMessage}</span>
                    <button
                        className="success-close"
                        onClick={() => setSuccessMessage(null)}
                        aria-label="Cerrar mensaje"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Información resumen */}
            <div className="group-list__summary">
                <div className="summary-card">
                    <span className="summary-card__value">{groups.length}</span>
                    <span className="summary-card__label">Total de grupos</span>
                </div>
                <div className="summary-card">
                    <span className="summary-card__value">
                        {groups.filter(g => g.status === 'ACTIVE').length}
                    </span>
                    <span className="summary-card__label">Grupos activos</span>
                </div>
                <div className="summary-card">
                    <span className="summary-card__value">
                        {groups.filter(g => g.status === 'PLANNED').length}
                    </span>
                    <span className="summary-card__label">Planificados</span>
                </div>
                <div className="summary-card">
                    <span className="summary-card__value">
                        {groups.filter(g => !g.teacherId || g.teacherId === null).length}
                    </span>
                    <span className="summary-card__label">Sin profesor</span>
                </div>
            </div>

            {/* Sección de búsqueda y filtros */}
            <div className="group-list__filters">
                {/* Barra de búsqueda */}
                <div className="group-list__search">
                    <input
                        type="text"
                        placeholder="Buscar por asignatura, profesor o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                {/* Filtros */}
                <div className="group-list__filter-controls">
                    {/* Filtro por estado */}
                    <div className="filter-group">
                        <label className="filter-label">Estado:</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Todos</option>
                            <option value="PLANNED">Planificado</option>
                            <option value="ACTIVE">Activo</option>
                            <option value="CLOSED">Cerrado</option>
                        </select>
                    </div>

                    {/* Filtro por tipo */}
                    <div className="filter-group">
                        <label className="filter-label">Tipo:</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Todos</option>
                            <option value="REGULAR">Regular</option>
                            <option value="INTENSIVE">Intensivo</option>
                        </select>
                    </div>

                    {/* Filtro por asignatura */}
                    <div className="filter-group">
                        <label className="filter-label">Asignatura:</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Todas</option>
                            {filterOptions.subjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por profesor */}
                    <div className="filter-group">
                        <label className="filter-label">Profesor:</label>
                        <select
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Todos</option>
                            {filterOptions.teachers.map(teacher => (
                                <option key={teacher} value={teacher}>
                                    {teacher}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón para limpiar filtros */}
                    <button
                        onClick={resetFilters}
                        className="btn btn--secondary btn--sm"
                        disabled={!searchTerm && selectedStatus === 'all' &&
                            selectedType === 'all' && selectedSubject === 'all' &&
                            selectedTeacher === 'all'}
                    >
                        Limpiar filtros
                    </button>
                </div>

                {/* Información de resultados */}
                <div className="group-list__results-info">
                    {processedGroups.length === groups.length ? (
                        <span>Mostrando todos los grupos</span>
                    ) : (
                        <span>
                            Mostrando {processedGroups.length} de {groups.length} grupos
                        </span>
                    )}
                </div>
            </div>

            {/* Tabla de grupos */}
            <div className="group-list__table-container">
                <table className="group-table">
                    <thead>
                    <tr>
                        <th
                            className="sortable"
                            onClick={() => handleSort('id')}
                        >
                            ID
                            {sortConfig?.key === 'id' && (
                                <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                            )}
                        </th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('subjectName')}
                        >
                            Asignatura
                            {sortConfig?.key === 'subjectName' && (
                                <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                            )}
                        </th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('teacherName')}
                        >
                            Profesor
                            {sortConfig?.key === 'teacherName' && (
                                <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                            )}
                        </th>
                        <th>Tipo</th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('status')}
                        >
                            Estado
                            {sortConfig?.key === 'status' && (
                                <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                            )}
                        </th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('enrolledStudents')}
                        >
                            Capacidad
                            {sortConfig?.key === 'enrolledStudents' && (
                                <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                            )}
                        </th>
                        <th
                            className="sortable"
                            onClick={() => handleSort('price')}
                        >
                            Precio
                            {sortConfig?.key === 'price' && (
                                <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                                    </span>
                            )}
                        </th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {processedGroups.map((group) => {
                        const occupancyInfo = getOccupancyInfo(
                            group.enrolledStudents,
                            group.maxCapacity
                        );

                        return (
                            <tr
                                key={group.id}
                                className="group-table__row"
                                onClick={(e) => {
                                    // Solo navegar si no se hizo clic en un botón
                                    if (!(e.target as HTMLElement).closest('button')) {
                                        navigate(`/admin/groups/${group.id}`);
                                    }
                                }}
                            >
                                <td className="group-table__id">#{group.id}</td>
                                <td className="group-table__subject">
                                    {group.subjectName}
                                </td>
                                <td className="group-table__teacher">
                                        <span className={!group.teacherId ? 'text-warning' : ''}>
                                            {group.teacherName || 'Sin asignar'}
                                        </span>
                                </td>
                                <td className="group-table__type">
                                    {getTypeBadge(group.type)}
                                </td>
                                <td className="group-table__status">
                                    {getStatusBadge(group.status)}
                                </td>
                                <td className="group-table__capacity">
                                    <div className="capacity-info">
                                            <span className="capacity-info__text">
                                                {group.enrolledStudents || 0}/{group.maxCapacity || 0}
                                            </span>
                                        <div className="occupancy-bar">
                                            <div
                                                className={occupancyInfo.className}
                                                style={{ width: `${occupancyInfo.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="group-table__price">${group.price || 0}</td>
                                <td className="group-table__actions">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/groups/${group.id}`);
                                        }}
                                        className="btn btn--sm btn--secondary"
                                        title="Ver detalles del grupo"
                                        aria-label={`Ver detalles del grupo ${group.subjectName}`}
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/groups/${group.id}/edit`);
                                        }}
                                        className="btn btn--sm btn--secondary"
                                        title="Editar grupo"
                                        aria-label={`Editar grupo ${group.subjectName}`}
                                        disabled={group.status !== 'PLANNED'}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(group);
                                        }}
                                        className="btn btn--sm btn--danger"
                                        title={
                                            group.status !== 'PLANNED'
                                                ? 'Solo se pueden eliminar grupos planificados'
                                                : (group.enrolledStudents || 0) > 0
                                                    ? 'No se pueden eliminar grupos con estudiantes'
                                                    : 'Eliminar grupo'
                                        }
                                        aria-label={`Eliminar grupo ${group.subjectName}`}
                                        disabled={group.status !== 'PLANNED' || (group.enrolledStudents || 0) > 0}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {processedGroups.length === 0 && (
                    <div className="group-list__empty">
                        {groups.length === 0 ? (
                            <>
                                <p>No hay grupos registrados en el sistema.</p>
                                <button
                                    onClick={() => navigate('/admin/groups/new')}
                                    className="btn btn--primary"
                                >
                                    Crear primer grupo
                                </button>
                            </>
                        ) : (
                            <p>No se encontraron grupos que coincidan con los filtros seleccionados.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Grupo"
                message="¿Estás seguro de que deseas eliminar este grupo?"
                itemName={groupToDelete ?
                    `${groupToDelete.subjectName} - Grupo #${groupToDelete.id}` :
                    undefined
                }
                isDeleting={isDeleting}
                error={deleteError}
            />
        </div>
    );
};