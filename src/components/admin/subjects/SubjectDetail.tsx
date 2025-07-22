// src/components/admin/subjects/SubjectDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subjectManagementService, groupManagementService } from '../../../services/admin';
import type { SubjectDto, CourseGroupDto } from '../../../types/admin.types';
import './SubjectDetail.css';

/**
 * Componente SubjectDetail - Vista detallada de una asignatura.
 *
 * Este componente ejemplifica varios patrones avanzados de React:
 *
 * 1. **Carga de datos relacionados**: No solo cargamos la asignatura, sino también
 *    sus grupos asociados, demostrando cómo manejar múltiples fuentes de datos.
 *
 * 2. **Estados de carga granulares**: Diferentes secciones pueden cargar independientemente,
 *    proporcionando mejor feedback al usuario.
 *
 * 3. **Navegación contextual**: Enlaces y acciones que mantienen al usuario orientado
 *    dentro de la jerarquía de la aplicación.
 *
 * 4. **Visualización de datos agregados**: Cálculos y estadísticas derivadas de los
 *    datos crudos para proporcionar insights valiosos.
 *
 * La estructura sigue el patrón de "vista maestra-detalle", donde este componente
 * actúa como el "detalle" que complementa la "vista maestra" (SubjectList).
 */
export const SubjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ========== Estados principales ==========

    /**
     * Información de la asignatura.
     * Este es el dato principal alrededor del cual gira todo el componente.
     */
    const [subject, setSubject] = useState<SubjectDto | null>(null);

    /**
     * Grupos asociados a esta asignatura.
     * Los grupos son la manifestación práctica de una asignatura: horarios,
     * profesores asignados, estudiantes inscritos, etc.
     */
    const [groups, setGroups] = useState<CourseGroupDto[]>([]);

    /**
     * Estados de carga separados para cada sección.
     * Esto permite mostrar la información tan pronto como esté disponible,
     * sin esperar a que todo termine de cargar.
     */
    const [loadingSubject, setLoadingSubject] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);

    /**
     * Manejo de errores con mensajes específicos.
     * Separamos los errores para dar feedback más preciso.
     */
    const [subjectError, setSubjectError] = useState<string | null>(null);
    const [groupsError, setGroupsError] = useState<string | null>(null);

    // ========== Estadísticas calculadas ==========

    /**
     * Calcula estadísticas agregadas de los grupos.
     * Estas métricas dan una visión rápida del "estado de salud" de la asignatura.
     */
    const statistics = React.useMemo(() => {
        if (!groups.length) {
            return {
                totalGroups: 0,
                activeGroups: 0,
                totalStudents: 0,
                totalCapacity: 0,
                occupancyRate: 0,
                teachersAssigned: 0
            };
        }

        const activeGroups = groups.filter(g => g.status === 'ACTIVE');
        const totalStudents = groups.reduce((sum, g) => sum + g.enrolledStudents, 0);
        const totalCapacity = groups.reduce((sum, g) => sum + g.maxCapacity, 0);
        const teachersAssigned = groups.filter(g => g.teacherId).length;

        return {
            totalGroups: groups.length,
            activeGroups: activeGroups.length,
            totalStudents,
            totalCapacity,
            occupancyRate: totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0,
            teachersAssigned
        };
    }, [groups]);

    // ========== Efectos para carga de datos ==========

    /**
     * Carga inicial de datos cuando el componente se monta.
     * Observa cómo cargamos datos en paralelo para mejor rendimiento.
     */
    useEffect(() => {
        if (id) {
            const subjectId = parseInt(id);
            // Cargar datos en paralelo
            loadSubjectData(subjectId);
            loadGroupsData(subjectId);
        }
    }, [id]);

    // ========== Funciones de carga de datos ==========

    /**
     * Carga los datos básicos de la asignatura.
     * Esta es la información principal que necesitamos mostrar.
     */
    const loadSubjectData = async (subjectId: number) => {
        try {
            setLoadingSubject(true);
            setSubjectError(null);

            const data = await subjectManagementService.getSubjectById(subjectId);
            console.log(data);
            setSubject(data);
        } catch (error) {
            console.error('Error al cargar la asignatura:', error);
            setSubjectError('No se pudo cargar la información de la asignatura.');
        } finally {
            setLoadingSubject(false);
        }
    };

    /**
     * Carga los grupos asociados a la asignatura.
     * Los grupos nos dan contexto sobre cómo se está impartiendo la asignatura.
     */
    const loadGroupsData = async (subjectId: number) => {
        try {
            setLoadingGroups(true);
            setGroupsError(null);

            // Aquí asumimos que el servicio de grupos tiene un método para obtener
            // grupos por asignatura. Si no existe, habría que implementarlo.
            const data = await groupManagementService.getGroupsBySubject(subjectId);
            console.log(data);
            setGroups(data);
        } catch (error) {
            console.error('Error al cargar los grupos:', error);
            setGroupsError('No se pudo cargar la información de los grupos.');
        } finally {
            setLoadingGroups(false);
        }
    };

    // ========== Manejadores de eventos ==========

    /**
     * Navega al formulario de edición de la asignatura.
     */
    const handleEdit = () => {
        navigate(`/admin/subjects/${id}/edit`);
    };

    /**
     * Navega a la lista de asignaturas.
     * Incluye una pequeña animación de "volver" para mejor UX.
     */
    const handleBack = () => {
        navigate('/admin/subjects');
    };

    /**
     * Navega al detalle de un grupo específico.
     * Esto demuestra la navegación jerárquica en la aplicación.
     */
    const handleViewGroup = (groupId: number) => {
        navigate(`/admin/groups/${groupId}`);
    };

    /**
     * Formatea el estado del grupo para mostrar.
     * Convierte los valores enum en texto legible para el usuario.
     */
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { text: string; className: string }> = {
            'ACTIVE': { text: 'Activo', className: 'badge--success' },
            'PENDING': { text: 'Pendiente', className: 'badge--warning' },
            'CANCELLED': { text: 'Cancelado', className: 'badge--danger' },
            'COMPLETED': { text: 'Completado', className: 'badge--secondary' }
        };

        const statusInfo = statusMap[status] || { text: status, className: 'badge--secondary' };

        return (
            <span className={`badge ${statusInfo.className}`}>
                {statusInfo.text}
            </span>
        );
    };

    /**
     * Calcula el porcentaje de ocupación de un grupo.
     * Útil para visualizar qué tan lleno está cada grupo.
     */
    const getOccupancyPercentage = (enrolled: number, max: number) => {
        if (max === 0) return 0;
        return Math.round((enrolled / max) * 100);
    };

    /**
     * Determina el color de la barra de ocupación según el porcentaje.
     * Verde para baja ocupación, amarillo para media, rojo para alta.
     */
    const getOccupancyColor = (percentage: number) => {
        if (percentage < 50) return 'occupancy--low';
        if (percentage < 80) return 'occupancy--medium';
        return 'occupancy--high';
    };

    // ========== Renderizado condicional para estados de carga/error ==========

    if (loadingSubject) {
        return (
            <div className="subject-detail__loading">
                <div className="spinner"></div>
                <p>Cargando información de la asignatura...</p>
            </div>
        );
    }

    if (subjectError || !subject) {
        return (
            <div className="subject-detail__error">
                <h2>Error al cargar la asignatura</h2>
                <p>{subjectError || 'La asignatura solicitada no existe.'}</p>
                <button onClick={handleBack} className="btn btn--secondary">
                    Volver a la lista
                </button>
            </div>
        );
    }

    // ========== Renderizado principal ==========

    return (
        <div className="subject-detail">
            {/* Breadcrumb para navegación contextual */}
            <nav className="breadcrumb" aria-label="Navegación">
                <Link to="/admin/dashboard">Dashboard</Link>
                <span className="breadcrumb__separator">/</span>
                <Link to="/admin/subjects">Asignaturas</Link>
                <span className="breadcrumb__separator">/</span>
                <span className="breadcrumb__current">{subject.name}</span>
            </nav>

            {/* Encabezado con información principal y acciones */}
            <div className="subject-detail__header">
                <div className="subject-detail__header-content">
                    <h1 className="subject-detail__title">{subject.name}</h1>
                    <div className="subject-detail__meta">
                        <span className="meta-item">
                            <strong>Carrera:</strong> {subject.major}
                        </span>
                        <span className="meta-item">
                            <strong>Año:</strong> {subject.courseYear}°
                        </span>
                        <span className="meta-item">
                            <strong>ID:</strong> {subject.id}
                        </span>
                    </div>
                </div>
                <div className="subject-detail__actions">
                    <button onClick={handleBack} className="btn btn--secondary">
                        ← Volver
                    </button>
                    <button onClick={handleEdit} className="btn btn--primary">
                        ✏️ Editar
                    </button>
                </div>
            </div>

            {/* Panel de estadísticas */}
            <div className="statistics-panel">
                <h2 className="statistics-panel__title">Estadísticas Generales</h2>
                <div className="statistics-grid">
                    <div className="statistic-card">
                        <div className="statistic-card__value">{statistics.totalGroups}</div>
                        <div className="statistic-card__label">Grupos Totales</div>
                    </div>
                    <div className="statistic-card">
                        <div className="statistic-card__value">{statistics.activeGroups}</div>
                        <div className="statistic-card__label">Grupos Activos</div>
                    </div>
                    <div className="statistic-card">
                        <div className="statistic-card__value">{statistics.totalStudents}</div>
                        <div className="statistic-card__label">Estudiantes Inscritos</div>
                    </div>
                    <div className="statistic-card">
                        <div className="statistic-card__value">{statistics.occupancyRate.toFixed(1)}%</div>
                        <div className="statistic-card__label">Tasa de Ocupación</div>
                    </div>
                </div>
            </div>

            {/* Sección de grupos */}
            <div className="groups-section">
                <div className="groups-section__header">
                    <h2 className="groups-section__title">Grupos de Curso</h2>
                    <Link to={`/admin/groups/new?subjectId=${subject.id}`} className="btn btn--primary btn--small">
                        + Crear Grupo
                    </Link>
                </div>

                {loadingGroups ? (
                    <div className="groups-section__loading">
                        <div className="spinner spinner--small"></div>
                        <p>Cargando grupos...</p>
                    </div>
                ) : groupsError ? (
                    <div className="alert alert--error">
                        {groupsError}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state__message">
                            No hay grupos creados para esta asignatura.
                        </p>
                        <p className="empty-state__hint">
                            Los estudiantes pueden solicitar la creación de grupos si no encuentran uno disponible.
                        </p>
                    </div>
                ) : (
                    <div className="groups-grid">
                        {groups.map(group => (
                            <div key={group.id} className="group-card">
                                <div className="group-card__header">
                                    <h3 className="group-card__name">Grupo {group.subjectName}</h3>
                                    {getStatusBadge(group.status)}
                                </div>

                                <div className="group-card__body">
                                    {group.teacherName ? (
                                        <p className="group-card__teacher">
                                            <strong>Profesor:</strong> {group.teacherName}
                                        </p>
                                    ) : (
                                        <p className="group-card__teacher group-card__teacher--unassigned">
                                            Sin profesor asignado
                                        </p>
                                    )}

                                    <div className="group-card__occupancy">
                                        <div className="occupancy-header">
                                            <span>Ocupación:</span>
                                            <span>{group.enrolledStudents} / {group.maxCapacity}</span>
                                        </div>
                                        <div className="occupancy-bar">
                                            <div
                                                className={`occupancy-bar__fill ${getOccupancyColor(getOccupancyPercentage(group.enrolledStudents, group.maxStudents))}`}
                                                style={{ width: `${getOccupancyPercentage(group.enrolledStudents, group.maxCapacity)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="group-card__footer">
                                    <button
                                        onClick={() => handleViewGroup(group.id)}
                                        className="btn btn--link"
                                    >
                                        Ver detalles →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Información adicional */}
            <div className="additional-info">
                <h2 className="additional-info__title">Información Adicional</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-item__label">Creado:</span>
                    </div>
                    {subject.updatedAt && (
                        <div className="info-item">
                            <span className="info-item__label">Última actualización:</span>
                            <span className="info-item__value">
                                {new Date(subject.updatedAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};