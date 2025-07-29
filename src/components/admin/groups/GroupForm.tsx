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
import { GROUP_TYPES, DAYS_OF_WEEK, CLASSROOMS } from '../../../constants/enums';
import './GroupForm.css';

/**
 * Componente GroupForm - Formulario unificado para crear y editar grupos.
 */
export const GroupForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // Estados del formulario
    const [formData, setFormData] = useState<CreateCourseGroupDto>({
        subjectId: 0,
        teacherId: undefined,
        type: 'REGULAR',
        price: 0,
        sessions: []
    });

    const [maxCapacity, setMaxCapacity] = useState<number>(30);
    const [originalGroup, setOriginalGroup] = useState<CourseGroupDto | null>(null);
    const [existingSessions, setExistingSessions] = useState<GroupSessionDto[]>([]);

    const [touched, setTouched] = useState<Record<string, boolean>>({
        subjectId: false,
        teacherId: false,
        type: false,
        price: false,
        maxCapacity: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [teachers, setTeachers] = useState<TeacherDto[]>([]);

    const [loadingGroup, setLoadingGroup] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [newSession, setNewSession] = useState<CreateGroupSessionDto>({
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '11:00:00',
        classroom: ''
    });

    const [showSessionModal, setShowSessionModal] = useState(false);

    // Efectos
    useEffect(() => {
        loadInitialData();
    }, [id]);

    useEffect(() => {
        validateForm();
    }, [formData, maxCapacity]);

    // Carga de datos
    const loadInitialData = async () => {
        try {
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
            console.log("cargando profesores");
            const data = await teacherManagementService.getAllTeachers();
            console.log(data);
            setTeachers(data); // Directamente es un array
        } catch (error) {
            console.error('Error al cargar profesores:', error);
            setTeachers([]);
        } finally {
            setLoadingTeachers(false);
        }
    };

    const loadGroup = async (groupId: number) => {
        try {
            setLoadingGroup(true);
            const group = await groupManagementService.getGroupById(groupId);

            // Verificar si el grupo puede ser editado
            if (group.status !== 'PLANNED') {
                setSubmitError('Solo se pueden editar grupos en estado PLANIFICADO');
                return;
            }

            setOriginalGroup(group);

            // Llenar el formulario con los datos del grupo
            setFormData({
                subjectId: group.subjectId,
                teacherId: group.teacherId || undefined,
                type: group.type,
                price: group.price,
                sessions: []
            });

            setMaxCapacity(group.maxCapacity);

            // Cargar sesiones existentes
            try {
                const sessions = await groupManagementService.getGroupSessions(groupId);
                setExistingSessions(sessions);
            } catch (error) {
                console.error('Error al cargar sesiones:', error);
            }
        } catch (error) {
            console.error('Error al cargar el grupo:', error);
            setSubmitError('Error al cargar los datos del grupo');
        } finally {
            setLoadingGroup(false);
        }
    };

    // Validación
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.subjectId || formData.subjectId === 0) {
            newErrors.subjectId = 'La asignatura es requerida';
        }

        if (!formData.type) {
            newErrors.type = 'El tipo de grupo es requerido';
        }

        if (formData.price < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }

        if (isEditMode && maxCapacity < 1) {
            newErrors.maxCapacity = 'La capacidad debe ser al menos 1';
        }

        if (isEditMode && originalGroup && maxCapacity < originalGroup.enrolledStudents) {
            newErrors.maxCapacity = `La capacidad no puede ser menor que los estudiantes inscritos (${originalGroup.enrolledStudents})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejadores de eventos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'maxCapacity') {
            setMaxCapacity(parseInt(value) || 0);
        } else if (name === 'subjectId' || name === 'teacherId') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || (name === 'teacherId' ? undefined : 0)
            }));
        } else if (name === 'price') {
            setFormData(prev => ({
                ...prev,
                [name]: parseFloat(value) || 0
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
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
    };

    const handleAddSession = () => {
        if (!newSession.classroom.trim()) {
            alert('El aula es requerida');
            return;
        }

        const session: CreateGroupSessionDto = {
            ...newSession,
            classroom: newSession.classroom.trim()
        };

        setFormData(prev => ({
            ...prev,
            sessions: [...prev.sessions, session]
        }));

        // Reset session form
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
            sessions: prev.sessions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Marcar todos los campos como tocados
        setTouched({
            subjectId: true,
            teacherId: true,
            type: true,
            price: true,
            maxCapacity: true
        });

        // Validar
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setSubmitError(null);

            if (isEditMode && id) {
                // Actualizar grupo
                const updateData = {
                    teacherId: formData.teacherId,
                    type: formData.type,
                    price: formData.price,
                    maxCapacity: maxCapacity
                };

                await groupManagementService.updateGroup(parseInt(id), updateData);
                navigate('/admin/groups', {
                    state: { message: 'Grupo actualizado exitosamente' }
                });
            } else {
                // Crear grupo
                if (!isEditMode && formData.sessions.length === 0) {
                    setSubmitError('Debe agregar al menos una sesión al grupo');
                    return;
                }

                await groupManagementService.createGroup(formData);
                navigate('/admin/groups', {
                    state: { message: 'Grupo creado exitosamente' }
                });
            }
        } catch (error: any) {
            console.error('Error al guardar el grupo:', error);
            const message = error.response?.data?.message || 'Error al guardar el grupo';
            setSubmitError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/groups');
    };

    // Renderizado condicional para estados de carga
    if (loadingGroup) {
        return (
            <div className="group-form__loading">
                <div className="spinner"></div>
                <p>Cargando información del grupo...</p>
            </div>
        );
    }

    if (isEditMode && submitError && originalGroup === null) {
        return (
            <div className="group-form__container">
                <div className="group-form group-form__error-state">
                    <h2>Error al cargar el grupo</h2>
                    <p>{submitError}</p>
                    <button onClick={() => navigate('/admin/groups')} className="btn btn--primary">
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    // Renderizado principal del formulario
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
                                        label: `${teacher.name} - ${teacher.email}`
                                    }))
                                ]}
                                error={errors.teacherId}
                                touched={touched.teacherId}
                            />

                            <FormField
                                type="select"
                                label="Tipo de Grupo"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                options={GROUP_TYPES}
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
                                            {DAYS_OF_WEEK.find(d => d.value === session.dayOfWeek)?.label} -
                                            {session.startTime.substring(0, 5)} a {session.endTime.substring(0, 5)} -
                                            Aula: {session.classroom}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!isEditMode && formData.sessions.length === 0 && (
                            <div className="group-form__empty-sessions">
                                <p>No hay sesiones agregadas. Haga clic en "Agregar Sesión" para añadir horarios.</p>
                            </div>
                        )}

                        {!isEditMode && formData.sessions.length > 0 && (
                            <div className="group-form__sessions-list">
                                {formData.sessions.map((session, index) => (
                                    <div key={index} className="session-item">
                                        <span>
                                            {DAYS_OF_WEEK.find(d => d.value === session.dayOfWeek)?.label} -
                                            {session.startTime.substring(0, 5)} a {session.endTime.substring(0, 5)} -
                                            Aula: {session.classroom}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSession(index)}
                                            className="btn btn--small btn--danger"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="group-form__actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn--secondary"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={saving || loadingSubjects || loadingTeachers}
                    >
                        {saving ? 'Guardando...' : (isEditMode ? 'Actualizar Grupo' : 'Crear Grupo')}
                    </button>
                </div>
            </form>

            {/* Modal para agregar sesión */}
            {showSessionModal && (
                <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Agregar Sesión</h3>
                        <div className="modal-form">
                            <FormField
                                type="select"
                                label="Día de la semana"
                                name="dayOfWeek"
                                value={newSession.dayOfWeek}
                                onChange={(e) => setNewSession(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                options={DAYS_OF_WEEK}
                            />
                            <FormField
                                type="time"
                                label="Hora de inicio"
                                name="startTime"
                                value={newSession.startTime.substring(0, 5)}
                                onChange={(e) => setNewSession(prev => ({ ...prev, startTime: `${e.target.value}:00` }))}
                            />
                            <FormField
                                type="time"
                                label="Hora de fin"
                                name="endTime"
                                value={newSession.endTime.substring(0, 5)}
                                onChange={(e) => setNewSession(prev => ({ ...prev, endTime: `${e.target.value}:00` }))}
                            />
                            <FormField
                                type="select"
                                label="Aula"
                                name="classroom"
                                value={newSession.classroom}
                                onChange={(e) => setNewSession(prev => ({ ...prev, classroom: e.target.value }))}
                                options={[
                                    { value: '', label: 'Seleccione un aula...' },
                                    ...CLASSROOMS
                                ]}
                                required
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