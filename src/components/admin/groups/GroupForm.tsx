// src/components/admin/groups/GroupForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../forms/FormField';
import { groupManagementService, subjectManagementService, teacherManagementService } from '../../../services/admin';
import type {
    CreateCourseGroupDto,
    CourseGroupDto,
    SubjectDto,
    TeacherDto,
    CreateGroupSessionDto,
    GroupSessionDto
} from '../../../types/admin.types';
import './GroupForm.css';

/**
 * Componente GroupForm - Formulario unificado para crear y editar grupos.
 *
 * Este componente gestiona:
 * 1. Creación de nuevos grupos con información básica
 * 2. Edición de grupos existentes (solo en estado PLANNED)
 * 3. Gestión de sesiones/horarios del grupo
 * 4. Asignación de profesor y asignatura
 *
 * La gestión de sesiones se maneja de forma separada:
 * - En creación: se pueden definir sesiones iniciales
 * - En edición: se gestionan mediante endpoints específicos de sesiones
 */
export const GroupForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // ========== Estados del formulario ==========

    /**
     * Datos principales del formulario
     */
    const [formData, setFormData] = useState<CreateCourseGroupDto>({
        subjectId: 0,
        teacherId: undefined,
        type: 'REGULAR',
        price: 0,
        sessions: []
    });

    /**
     * Capacidad máxima (solo para edición)
     */
    const [maxCapacity, setMaxCapacity] = useState<number>(30);

    /**
     * Grupo original (para edición)
     */
    const [originalGroup, setOriginalGroup] = useState<CourseGroupDto | null>(null);

    /**
     * Sesiones del grupo (para mostrar en edición)
     */
    const [existingSessions, setExistingSessions] = useState<GroupSessionDto[]>([]);

    /**
     * Estados para campos tocados
     */
    const [touched, setTouched] = useState<Record<string, boolean>>({
        subjectId: false,
        teacherId: false,
        type: false,
        price: false,
        maxCapacity: false
    });

    /**
     * Errores de validación
     */
    const [errors, setErrors] = useState<Record<string, string>>({});

    /**
     * Listas para los selects
     */
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [teachers, setTeachers] = useState<TeacherDto[]>([]);

    /**
     * Estados de carga
     */
    const [loadingGroup, setLoadingGroup] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [saving, setSaving] = useState(false);

    /**
     * Error de envío
     */
    const [submitError, setSubmitError] = useState<string | null>(null);

    /**
     * Estado de la sesión temporal para agregar
     */
    const [newSession, setNewSession] = useState<CreateGroupSessionDto>({
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '11:00:00',
        classroom: ''
    });

    /**
     * Modal de sesiones
     */
    const [showSessionModal, setShowSessionModal] = useState(false);

    // ========== Tipos de grupo disponibles ==========
    const groupTypes = [
        { value: 'REGULAR', label: 'Regular' },
        { value: 'INTENSIVE', label: 'Intensivo' },
        { value: 'REMEDIAL', label: 'Remedial' },
        { value: 'SUMMER', label: 'Verano' }
    ];

    // ========== Días de la semana ==========
    const daysOfWeek = [
        { value: 'MONDAY', label: 'Lunes' },
        { value: 'TUESDAY', label: 'Martes' },
        { value: 'WEDNESDAY', label: 'Miércoles' },
        { value: 'THURSDAY', label: 'Jueves' },
        { value: 'FRIDAY', label: 'Viernes' },
        { value: 'SATURDAY', label: 'Sábado' },
        { value: 'SUNDAY', label: 'Domingo' }
    ];

    // ========== Efectos ==========

    useEffect(() => {
        loadInitialData();
    }, [id]);

    // ========== Carga de datos ==========

    const loadInitialData = async () => {
        try {
            // Cargar listas en paralelo
            const loadPromises = [loadSubjects(), loadTeachers()];

            if (isEditMode && id) {
                loadPromises.push(loadGroup(parseInt(id)));
            }

            await Promise.all(loadPromises);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
        }
    };

    const loadSubjects = async () => {
        try {
            setLoadingSubjects(true);
            const data = await subjectManagementService.getAllSubjects();
            setSubjects(data);
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
            setErrors(prev => ({ ...prev, general: 'Error al cargar las asignaturas' }));
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadTeachers = async () => {
        try {
            setLoadingTeachers(true);
            // Cargar todos los profesores sin paginación
            const response = await teacherManagementService.getAllTeachers({ size: 1000 });
            setTeachers(response.content);
        } catch (error) {
            console.error('Error al cargar profesores:', error);
            setErrors(prev => ({ ...prev, general: 'Error al cargar los profesores' }));
        } finally {
            setLoadingTeachers(false);
        }
    };

    const loadGroup = async (groupId: number) => {
        try {
            setLoadingGroup(true);
            const [group, sessions] = await Promise.all([
                groupManagementService.getGroupById(groupId),
                groupManagementService.getGroupSessions(groupId)
            ]);

            setOriginalGroup(group);
            setExistingSessions(sessions);
            setMaxCapacity(group.maxCapacity);

            // Poblar el formulario con los datos del grupo
            setFormData({
                subjectId: group.subjectId,
                teacherId: group.teacherId,
                type: group.type,
                price: group.price,
                sessions: [] // Las sesiones existentes se manejan por separado
            });
        } catch (error) {
            console.error('Error al cargar el grupo:', error);
            setSubmitError('Error al cargar la información del grupo');
        } finally {
            setLoadingGroup(false);
        }
    };

    // ========== Manejadores de cambios ==========

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'maxCapacity') {
            setMaxCapacity(parseInt(value) || 0);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'subjectId' || name === 'teacherId' || name === 'price'
                    ? (value ? parseInt(value) : (name === 'teacherId' ? undefined : 0))
                    : value
            }));
        }

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, e.target.value);
    };

    // ========== Validación ==========

    const validateField = (name: string, value: any) => {
        let error = '';

        switch (name) {
            case 'subjectId':
                if (!value || value === '0') {
                    error = 'Debe seleccionar una asignatura';
                }
                break;
            case 'type':
                if (!value) {
                    error = 'Debe seleccionar un tipo de grupo';
                }
                break;
            case 'price':
                const price = parseInt(value);
                if (isNaN(price) || price < 0) {
                    error = 'El precio debe ser un número positivo';
                }
                break;
            case 'maxCapacity':
                const capacity = parseInt(value);
                if (isNaN(capacity) || capacity < 1) {
                    error = 'La capacidad debe ser al menos 1';
                }
                if (isEditMode && originalGroup && capacity < originalGroup.enrolledStudents) {
                    error = `La capacidad no puede ser menor a los estudiantes inscritos (${originalGroup.enrolledStudents})`;
                }
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.subjectId || formData.subjectId === 0) {
            newErrors.subjectId = 'Debe seleccionar una asignatura';
        }

        if (!formData.type) {
            newErrors.type = 'Debe seleccionar un tipo de grupo';
        }

        if (formData.price < 0) {
            newErrors.price = 'El precio debe ser un número positivo';
        }

        if (isEditMode) {
            if (maxCapacity < 1) {
                newErrors.maxCapacity = 'La capacidad debe ser al menos 1';
            }
            if (originalGroup && maxCapacity < originalGroup.enrolledStudents) {
                newErrors.maxCapacity = `La capacidad no puede ser menor a los estudiantes inscritos (${originalGroup.enrolledStudents})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ========== Gestión de sesiones ==========

    const handleAddSession = () => {
        if (!newSession.classroom.trim()) {
            alert('Debe especificar un aula');
            return;
        }

        // Validar que la hora de fin sea posterior a la de inicio
        if (newSession.endTime <= newSession.startTime) {
            alert('La hora de fin debe ser posterior a la hora de inicio');
            return;
        }

        setFormData(prev => ({
            ...prev,
            sessions: [...(prev.sessions || []), { ...newSession }]
        }));

        // Resetear el formulario de sesión
        setNewSession({
            dayOfWeek: 'MONDAY',
            startTime: '09:00:00',
            endTime: '11:00:00',
            classroom: ''
        });

        setShowSessionModal(false);
    };

    const handleRemoveSession = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions?.filter((_, i) => i !== index) || []
        }));
    };

    const formatTime = (time: string) => {
        // Convertir HH:mm:ss a HH:mm para mostrar
        return time.substring(0, 5);
    };

    // ========== Envío del formulario ==========

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setSubmitError(null);

            if (isEditMode && originalGroup) {
                // Construir el DTO completo para actualización
                const updateData: CourseGroupDto = {
                    ...originalGroup,
                    subjectId: formData.subjectId,
                    teacherId: formData.teacherId || 0,
                    type: formData.type,
                    price: formData.price,
                    maxCapacity: maxCapacity
                };

                await groupManagementService.updateGroup(parseInt(id!), updateData);

                // Las sesiones se gestionan por separado en edición
                navigate('/admin/groups');
            } else {
                // Crear nuevo grupo
                await groupManagementService.createGroup(formData);
                navigate('/admin/groups');
            }
        } catch (error: any) {
            console.error('Error al guardar el grupo:', error);
            setSubmitError(
                error.response?.data?.message ||
                error.message ||
                'Error al guardar el grupo'
            );
        } finally {
            setSaving(false);
        }
    };

    // ========== Renderizado ==========

    if (loadingGroup || loadingSubjects || loadingTeachers) {
        return (
            <div className="group-form__loading">
                <div className="spinner"></div>
                <p>Cargando información...</p>
            </div>
        );
    }

    // No permitir edición de grupos que no están en estado PLANNED
    if (isEditMode && originalGroup && originalGroup.status !== 'PLANNED') {
        return (
            <div className="group-form__container">
                <div className="group-form__error-state">
                    <h2>Grupo no editable</h2>
                    <p>Solo se pueden editar grupos en estado PLANNED.</p>
                    <p>Este grupo está en estado: <strong>{originalGroup.status}</strong></p>
                    <button
                        onClick={() => navigate('/admin/groups')}
                        className="btn btn--secondary"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group-form__container">
            <form onSubmit={handleSubmit} className="group-form">
                <div className="group-form__header">
                    <h1 className="group-form__title">
                        {isEditMode ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                    </h1>
                    <p className="group-form__subtitle">
                        {isEditMode
                            ? 'Modifique la información del grupo'
                            : 'Complete la información para crear un nuevo grupo'}
                    </p>
                </div>

                {submitError && (
                    <div className="group-form__error-message">
                        <span className="error-icon">⚠️</span>
                        <span>{submitError}</span>
                    </div>
                )}

                <div className="group-form__content">
                    <div className="group-form__section">
                        <h2 className="group-form__section-title">Información Básica</h2>

                        <div className="group-form__grid">
                            <FormField
                                type="select"
                                label="Asignatura"
                                name="subjectId"
                                value={formData.subjectId.toString()}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                options={[
                                    { value: '0', label: 'Seleccione una asignatura...' },
                                    ...subjects.map(subject => ({
                                        value: subject.id!.toString(),
                                        label: `${subject.name} - ${subject.major} (Año ${subject.courseYear})`
                                    }))
                                ]}
                                error={errors.subjectId}
                                touched={touched.subjectId}
                                required
                                disabled={isEditMode}
                            />

                            <FormField
                                type="select"
                                label="Profesor"
                                name="teacherId"
                                value={formData.teacherId?.toString() || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                options={[
                                    { value: '', label: 'Sin asignar' },
                                    ...teachers.map(teacher => ({
                                        value: teacher.id!.toString(),
                                        label: teacher.name
                                    }))
                                ]}
                                error={errors.teacherId}
                                touched={touched.teacherId}
                                helperText="Puede asignar un profesor ahora o después"
                            />

                            <FormField
                                type="select"
                                label="Tipo de Grupo"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                options={groupTypes}
                                error={errors.type}
                                touched={touched.type}
                                required
                            />

                            <FormField
                                type="number"
                                label="Precio"
                                name="price"
                                value={formData.price.toString()}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.price}
                                touched={touched.price}
                                required
                                min="0"
                                step="0.01"
                            />

                            {isEditMode && (
                                <FormField
                                    type="number"
                                    label="Capacidad Máxima"
                                    name="maxCapacity"
                                    value={maxCapacity.toString()}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.maxCapacity}
                                    touched={touched.maxCapacity}
                                    required
                                    min="1"
                                    helperText={originalGroup?.enrolledStudents
                                        ? `Estudiantes inscritos: ${originalGroup.enrolledStudents}`
                                        : undefined}
                                />
                            )}
                        </div>
                    </div>

                    <div className="group-form__section">
                        <h2 className="group-form__section-title">
                            Horario del Grupo
                            {!isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => setShowSessionModal(true)}
                                    className="btn btn--small btn--secondary"
                                >
                                    Agregar Sesión
                                </button>
                            )}
                        </h2>

                        {isEditMode && existingSessions.length > 0 && (
                            <div className="group-form__info-box">
                                <p>Las sesiones del grupo se gestionan desde la vista de detalle del grupo.</p>
                                <p><strong>Sesiones actuales:</strong></p>
                                <ul className="group-form__session-list">
                                    {existingSessions.map((session, index) => (
                                        <li key={index}>
                                            {daysOfWeek.find(d => d.value === session.dayOfWeek)?.label || session.dayOfWeek} -
                                            {formatTime(session.startTime)} a {formatTime(session.endTime)} -
                                            Aula: {session.classroom}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!isEditMode && formData.sessions && formData.sessions.length > 0 && (
                            <div className="group-form__sessions">
                                <table className="group-form__sessions-table">
                                    <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Hora Inicio</th>
                                        <th>Hora Fin</th>
                                        <th>Aula</th>
                                        <th>Acciones</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {formData.sessions.map((session, index) => (
                                        <tr key={index}>
                                            <td>{daysOfWeek.find(d => d.value === session.dayOfWeek)?.label}</td>
                                            <td>{formatTime(session.startTime)}</td>
                                            <td>{formatTime(session.endTime)}</td>
                                            <td>{session.classroom}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSession(index)}
                                                    className="btn btn--small btn--danger"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!isEditMode && (!formData.sessions || formData.sessions.length === 0) && (
                            <p className="group-form__empty-state">
                                No se han agregado sesiones. Puede crear el grupo sin horario y agregarlo después.
                            </p>
                        )}
                    </div>
                </div>

                <div className="group-form__actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/groups')}
                        className="btn btn--secondary"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : (isEditMode ? 'Actualizar Grupo' : 'Crear Grupo')}
                    </button>
                </div>
            </form>

            {/* Modal para agregar sesión */}
            {showSessionModal && !isEditMode && (
                <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Agregar Sesión</h3>
                        <div className="modal-form">
                            <FormField
                                type="select"
                                label="Día de la Semana"
                                name="dayOfWeek"
                                value={newSession.dayOfWeek}
                                onChange={(e) => setNewSession(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                options={daysOfWeek}
                            />
                            <FormField
                                type="time"
                                label="Hora de Inicio"
                                name="startTime"
                                value={formatTime(newSession.startTime)}
                                onChange={(e) => setNewSession(prev => ({
                                    ...prev,
                                    startTime: e.target.value + ':00'
                                }))}
                            />
                            <FormField
                                type="time"
                                label="Hora de Fin"
                                name="endTime"
                                value={formatTime(newSession.endTime)}
                                onChange={(e) => setNewSession(prev => ({
                                    ...prev,
                                    endTime: e.target.value + ':00'
                                }))}
                            />
                            <FormField
                                type="text"
                                label="Aula"
                                name="classroom"
                                value={newSession.classroom}
                                onChange={(e) => setNewSession(prev => ({ ...prev, classroom: e.target.value }))}
                                placeholder="Ej: A-101"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => setShowSessionModal(false)}
                                className="btn btn--secondary"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddSession}
                                className="btn btn--primary"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};