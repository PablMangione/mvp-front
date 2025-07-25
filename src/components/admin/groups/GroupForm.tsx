// src/components/admin/groups/GroupForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../forms/FormField';
import { SessionModal } from '../modals/SessionModal';
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
 * Ahora utiliza SessionModal para una mejor UX al agregar sesiones.
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
            const response = await subjectManagementService.getAllSubjects(0, 1000);
            setSubjects(response.content || []);
        } catch (error) {
            console.error('Error al cargar asignaturas:', error);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadTeachers = async () => {
        try {
            setLoadingTeachers(true);
            const response = await teacherManagementService.getAllTeachers(0, 1000);
            setTeachers(response.content || []);
        } catch (error) {
            console.error('Error al cargar profesores:', error);
        } finally {
            setLoadingTeachers(false);
        }
    };

    const loadGroup = async (groupId: number) => {
        try {
            setLoadingGroup(true);
            const group = await groupManagementService.getGroupById(groupId);
            setOriginalGroup(group);

            // Cargar sesiones existentes
            const sessions = await groupManagementService.getGroupSessions(groupId);
            setExistingSessions(sessions);

            // Actualizar el formulario con los datos del grupo
            setFormData({
                subjectId: group.subjectId,
                teacherId: group.teacherId || undefined,
                type: group.type,
                price: group.price,
                sessions: [] // Las sesiones existentes no se pueden editar desde aquí
            });

            setMaxCapacity(group.maxCapacity);
        } catch (error) {
            console.error('Error al cargar el grupo:', error);
            setSubmitError('No se pudo cargar la información del grupo.');
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

        if (maxCapacity < 1) {
            newErrors.maxCapacity = 'La capacidad debe ser al menos 1';
        }

        if (!isEditMode && formData.sessions.length === 0) {
            newErrors.sessions = 'Debe agregar al menos una sesión';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejadores
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({
            subjectId: true,
            teacherId: true,
            type: true,
            price: true,
            maxCapacity: true
        });

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setSubmitError(null);

            if (isEditMode && id) {
                await groupManagementService.updateGroup(parseInt(id), {
                    ...formData,
                    maxCapacity
                });
                alert('Grupo actualizado exitosamente');
            } else {
                const createdGroup = await groupManagementService.createGroup({
                    ...formData,
                    maxCapacity
                });
                alert('Grupo creado exitosamente');
            }

            navigate('/admin/groups');
        } catch (error: any) {
            console.error('Error al guardar el grupo:', error);
            setSubmitError(
                error.response?.data?.message ||
                'Ocurrió un error al guardar el grupo. Por favor intente nuevamente.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.')) {
            navigate('/admin/groups');
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'maxCapacity') {
            setMaxCapacity(parseInt(value) || 1);
        } else if (name === 'subjectId' || name === 'teacherId') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? parseInt(value) : (name === 'teacherId' ? undefined : 0)
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

    const handleAddSession = (sessionData: CreateGroupSessionDto) => {
        setFormData(prev => ({
            ...prev,
            sessions: [...prev.sessions, sessionData]
        }));

        setShowSessionModal(false);

        // Limpiar error de sesiones si existe
        if (errors.sessions) {
            setErrors(prev => {
                const { sessions: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleRemoveSession = (index: number) => {
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions.filter((_, i) => i !== index)
        }));
    };

    // Renderizado
    if (loadingGroup) {
        return (
            <div className="group-form__container">
                <div className="group-form__loading">
                    <div className="spinner"></div>
                    <p>Cargando información del grupo...</p>
                </div>
            </div>
        );
    }

    if (isEditMode && originalGroup && originalGroup.enrolledStudents > 0) {
        return (
            <div className="group-form__container">
                <div className="group-form__error-state">
                    <h2>Grupo no editable</h2>
                    <p>Este grupo tiene estudiantes inscritos y no puede ser editado.</p>
                    <p>Para realizar cambios, debe crear un nuevo grupo.</p>
                    <button onClick={() => navigate('/admin/groups')} className="btn btn--primary">
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group-form__container">
            <form className="group-form" onSubmit={handleSubmit}>
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
                        {submitError}
                    </div>
                )}

                <div className="group-form__content">
                    <div className="group-form__section">
                        <h2 className="group-form__section-title">Información General</h2>
                        <div className="group-form__grid">
                            <FormField
                                type="select"
                                label="Asignatura"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                error={touched.subjectId ? errors.subjectId : undefined}
                                required
                                disabled={isEditMode}
                                options={[
                                    { value: 0, label: 'Seleccione una asignatura...' },
                                    ...subjects.map(s => ({
                                        value: s.id,
                                        label: `${s.name} - ${s.major} (${s.courseYear}° año)`
                                    }))
                                ]}
                            />

                            <FormField
                                type="select"
                                label="Profesor (Opcional)"
                                name="teacherId"
                                value={formData.teacherId || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                error={touched.teacherId ? errors.teacherId : undefined}
                                options={[
                                    { value: '', label: 'Sin asignar' },
                                    ...teachers.map(t => ({
                                        value: t.id,
                                        label: t.name
                                    }))
                                ]}
                            />

                            <FormField
                                type="select"
                                label="Tipo de Grupo"
                                name="type"
                                value={formData.type}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                error={touched.type ? errors.type : undefined}
                                required
                                options={GROUP_TYPES}
                            />

                            <FormField
                                type="number"
                                label="Precio (€)"
                                name="price"
                                value={formData.price}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                error={touched.price ? errors.price : undefined}
                                required
                                min="0"
                                step="0.01"
                            />

                            <FormField
                                type="number"
                                label="Capacidad Máxima"
                                name="maxCapacity"
                                value={maxCapacity}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                error={touched.maxCapacity ? errors.maxCapacity : undefined}
                                required
                                min="1"
                                helpText={
                                    isEditMode && originalGroup
                                        ? `Estudiantes inscritos: ${originalGroup.enrolledStudents}`
                                        : undefined
                                }
                            />
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

                        {errors.sessions && touched.subjectId && (
                            <p className="field-error">{errors.sessions}</p>
                        )}

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
                            <div className="group-form__empty-state">
                                <p>No hay sesiones agregadas. Haga clic en "Agregar Sesión" para añadir horarios.</p>
                            </div>
                        )}

                        {!isEditMode && formData.sessions.length > 0 && (
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
                                            <td>{DAYS_OF_WEEK.find(d => d.value === session.dayOfWeek)?.label}</td>
                                            <td>{session.startTime.substring(0, 5)}</td>
                                            <td>{session.endTime.substring(0, 5)}</td>
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

            {/* Modal mejorado para agregar sesión */}
            <SessionModal
                isOpen={showSessionModal}
                onClose={() => setShowSessionModal(false)}
                onSave={handleAddSession}
                groupId={isEditMode && id ? parseInt(id) : undefined}
                existingSessions={formData.sessions}
                saving={false}
            />
        </div>
    );
};