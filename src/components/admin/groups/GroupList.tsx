// src/components/admin/groups/GroupList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupManagementService } from '../../../services/admin';
import type { CourseGroupDto } from '../../../types/admin.types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import './GroupList.css';

export const GroupList: React.FC = () => {
    const navigate = useNavigate();

    // Estados del componente
    const [groups, setGroups] = useState<CourseGroupDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Estados para búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{
        key: keyof CourseGroupDto;
        direction: 'asc' | 'desc';
    } | null>(null);

    // Estados para el modal de eliminación
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<CourseGroupDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Cargar grupos al montar el componente
    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await groupManagementService.getAllGroups();
            setGroups(data);
        } catch (error) {
            console.error('Error al cargar grupos:', error);
            setError('No se pudieron cargar los grupos. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Filtrado y ordenamiento
    const processedGroups = useMemo(() => {
        let filtered = [...groups];

        // Aplicar búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(group =>
                group.subjectName.toLowerCase().includes(searchLower) ||
                group.teacherName?.toLowerCase().includes(searchLower) ||
                group.id.toString().includes(searchLower)
            );
        }

        // Aplicar filtros
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(group => group.status === selectedStatus);
        }

        if (selectedType !== 'all') {
            filtered = filtered.filter(group => group.type === selectedType);
        }

        if (selectedSubject !== 'all') {
            filtered = filtered.filter(group => group.subjectName === selectedSubject);
        }

        if (selectedTeacher !== 'all') {
            filtered = filtered.filter(group => group.teacherName === selectedTeacher);
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

    // Manejadores de eventos
    const handleCreate = () => {
        console.log('Navegando a crear nuevo grupo...');
        navigate('/admin/groups/new');
    };

    const handleView = (groupId: number) => {
        console.log('Navegando a ver grupo:', groupId);
        navigate(`/admin/groups/${groupId}`);
    };

    const handleEdit = (groupId: number) => {
        console.log('Navegando a editar grupo:', groupId);
        navigate(`/admin/groups/${groupId}/edit`);
    };

    const handleSort = (key: keyof CourseGroupDto) => {
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

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedSubject('all');
        setSelectedTeacher('all');
        setSortConfig(null);
    };

    // Funciones para manejo del modal de eliminación
    const handleDeleteClick = (group: CourseGroupDto) => {
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

    const handleDeleteConfirm = async () => {
        if (!groupToDelete) return;

        try {
            setIsDeleting(true);
            setDeleteError(null);

            await groupManagementService.deleteGroup(groupToDelete.id);

            setGroups(prevGroups =>
                prevGroups.filter(group => group.id !== groupToDelete.id)
            );

            setIsDeleteModalOpen(false);
            setGroupToDelete(null);

            setSuccessMessage(`El grupo "${groupToDelete.subjectName}" ha sido eliminado exitosamente`);

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

    const handleModalClose = () => {
        setIsDeleteModalOpen(false);
        setGroupToDelete(null);
        setDeleteError(null);
    };

    // Renderizado condicional para estados de carga y error
    if (loading) {
        return (
            <div className="group-list__loading">
                <div className="spinner"></div>
                <p>Cargando grupos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="group-list__error">
                <p>{error}</p>
                <button onClick={loadGroups} className="btn btn--primary">
                    Reintentar
                </button>
            </div>
        );
    }

    // Renderizado principal
    return (
        <div className="group-list">
            {/* Header */}
            <div className="group-list__header">
                <div className="group-list__header-content">
                    <h1 className="group-list__title">Gestión de Grupos</h1>
                    <p className="group-list__subtitle">
                        Administra los grupos de curso del sistema
                    </p>
                </div>
                <div className="group-list__header-actions">
                    <button
                        onClick={handleCreate}
                        className="btn btn--primary"
                        aria-label="Crear nuevo grupo"
                    >
                        <span className="btn__icon">➕</span>
                        Crear Nuevo Grupo
                    </button>
                </div>
            </div>

            {/* Mensaje de éxito */}
            {successMessage && (
                <div className="group-list__success-message">
                    <span className="success-icon">✓</span>
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

            {/* Tarjetas de resumen */}
            <div className="group-list__summary">
                <div className="summary-card">
                    <div className="summary-card__value">{groups.length}</div>
                    <div className="summary-card__label">Total de Grupos</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__value">
                        {groups.filter(g => g.status === 'ACTIVE').length}
                    </div>
                    <div className="summary-card__label">Grupos Activos</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__value">
                        {groups.filter(g => g.status === 'PLANNED').length}
                    </div>
                    <div className="summary-card__label">Grupos Planificados</div>
                </div>
                <div className="summary-card">
                    <div className="summary-card__value">
                        {groups.reduce((sum, g) => sum + (g.enrolledStudents || 0), 0)}
                    </div>
                    <div className="summary-card__label">Total Estudiantes</div>
                </div>
            </div>

            {/* Filtros */}
            <div className="group-list__filters">
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

                <div className="group-list__filter-controls">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="PLANNED">Planificado</option>
                        <option value="ACTIVE">Activo</option>
                        <option value="COMPLETED">Completado</option>
                        <option value="CANCELLED">Cancelado</option>
                    </select>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="REGULAR">Regular</option>
                        <option value="INTENSIVE">Intensivo</option>
                        <option value="WORKSHOP">Taller</option>
                    </select>

                    <button
                        onClick={resetFilters}
                        className="btn btn--secondary"
                        disabled={!searchTerm && selectedStatus === 'all' && selectedType === 'all'}
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Tabla de grupos */}
            <div className="group-list__table-container">
                <table className="group-table">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('id')} className="sortable">
                            ID {sortConfig?.key === 'id' && (
                            <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                        )}
                        </th>
                        <th onClick={() => handleSort('subjectName')} className="sortable">
                            Asignatura {sortConfig?.key === 'subjectName' && (
                            <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                        )}
                        </th>
                        <th onClick={() => handleSort('teacherName')} className="sortable">
                            Profesor {sortConfig?.key === 'teacherName' && (
                            <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                        )}
                        </th>
                        <th>Estado</th>
                        <th>Tipo</th>
                        <th>Capacidad</th>
                        <th onClick={() => handleSort('price')} className="sortable">
                            Precio {sortConfig?.key === 'price' && (
                            <span className="sort-indicator">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                        )}
                        </th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {processedGroups.map((group) => {
                        const occupancyPercentage = group.maxCapacity > 0
                            ? Math.round((group.enrolledStudents / group.maxCapacity) * 100)
                            : 0;

                        const occupancyClass = occupancyPercentage < 50 ? 'low' :
                            occupancyPercentage < 80 ? 'medium' :
                                occupancyPercentage < 100 ? 'high' : 'full';

                        return (
                            <tr
                                key={group.id}
                                className="group-table__row"
                                onClick={() => handleView(group.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>{group.id}</td>
                                <td className="group-table__subject">{group.subjectName}</td>
                                <td className="group-table__teacher">
                                    {group.teacherName || <span className="text-muted">Sin asignar</span>}
                                </td>
                                <td>
                                        <span className={`status-badge status-badge--${group.status.toLowerCase()}`}>
                                            {group.status === 'PLANNED' && 'Planificado'}
                                            {group.status === 'ACTIVE' && 'Activo'}
                                            {group.status === 'COMPLETED' && 'Completado'}
                                            {group.status === 'CANCELLED' && 'Cancelado'}
                                        </span>
                                </td>
                                <td>
                                        <span className={`type-badge type-badge--${group.type.toLowerCase()}`}>
                                            {group.type === 'REGULAR' && 'Regular'}
                                            {group.type === 'INTENSIVE' && 'Intensivo'}
                                            {group.type === 'WORKSHOP' && 'Taller'}
                                        </span>
                                </td>
                                <td>
                                    <div className="capacity-info">
                                            <span className="capacity-info__text">
                                                {group.enrolledStudents}/{group.maxCapacity}
                                            </span>
                                        <div className="occupancy-bar">
                                            <div
                                                className={`occupancy-bar__fill occupancy-bar__fill--${occupancyClass}`}
                                                style={{ width: `${occupancyPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="group-table__price">
                                    €{group.price.toFixed(2)}
                                </td>
                                <td className="group-table__actions">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleView(group.id);
                                        }}
                                        className="btn btn--sm btn--secondary"
                                        title="Ver detalles"
                                        aria-label={`Ver detalles del grupo ${group.subjectName}`}
                                    >
                                        👁️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(group.id);
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
                                <button onClick={handleCreate} className="btn btn--primary">
                                    Crear Primer Grupo
                                </button>
                            </>
                        ) : (
                            <p>No se encontraron grupos que coincidan con los filtros aplicados.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleModalClose}
                onConfirm={handleDeleteConfirm}
                itemName={groupToDelete?.subjectName || ''}
                itemType="grupo"
                isDeleting={isDeleting}
                error={deleteError}
            />
        </div>
    );
};