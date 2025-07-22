// src/components/admin/groups/GroupForm.tsx
import React, { useState, useEffect } from 'react';
import { FormModal } from '../common';
import type {
    CourseGroupDto,
    CreateGroupDto,
    UpdateGroupDto,
    GroupSessionDto,
    SubjectDto,
    TeacherDto
} from '../../../types/admin.types';

interface GroupFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateGroupDto | UpdateGroupDto) => Promise<void>;
    group?: CourseGroupDto | null;
    subjects: SubjectDto[];
    teachers: TeacherDto[];
    loading?: boolean;
}

const DAYS_OF_WEEK = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
];

/**
 * Formulario para crear o editar grupos.
 * Incluye gestión de horarios con múltiples sesiones.
 */
export const GroupForm: React.FC<GroupFormProps> = ({
                                                        isOpen,
                                                        onClose,
                                                        onSubmit,
                                                        group,
                                                        subjects,
                                                        teachers,
                                                        loading
                                                    }) => {
    const [formData, setFormData] = useState<CreateGroupDto>({
        subjectId: 0,
        groupNumber: 1,
        teacherId: undefined,
        schedule: [],
        capacity: 30
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newSession, setNewSession] = useState<GroupSessionDto>({
        dayOfWeek: 1,
        startTime: '',
        endTime: ''
    });

    // Cargar datos del grupo si es edición
    useEffect(() => {
        if (group) {
            setFormData({
                subjectId: group.subject.id,
                groupNumber: group.groupNumber,
                teacherId: group.teacher?.id,
                schedule: [...group.schedule],
                capacity: group.capacity
            });
        } else {
            setFormData({
                subjectId: 0,
                groupNumber: 1,
                teacherId: undefined,
                schedule: [],
                capacity: 30
            });
        }
        setErrors({});
    }, [group]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewSession(prev => ({
            ...prev,
            [name]: name === 'dayOfWeek' ? Number(value) : value
        }));
    };

    const addSession = () => {
        if (!newSession.startTime || !newSession.endTime) {
            setErrors(prev => ({ ...prev, session: 'Complete todos los campos del horario' }));
            return;
        }

        if (newSession.startTime >= newSession.endTime) {
            setErrors(prev => ({ ...prev, session: 'La hora de inicio debe ser menor a la de fin' }));
            return;
        }

        // Verificar solapamiento
        const hasOverlap = formData.schedule.some(session =>
            session.dayOfWeek === newSession.dayOfWeek &&
            ((newSession.startTime >= session.startTime && newSession.startTime < session.endTime) ||
                (newSession.endTime > session.startTime && newSession.endTime <= session.endTime))
        );

        if (hasOverlap) {
            setErrors(prev => ({ ...prev, session: 'El horario se solapa con otra sesión' }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            schedule: [...prev.schedule, newSession]
        }));

        // Limpiar formulario de sesión
        setNewSession({
            dayOfWeek: 1,
            startTime: '',
            endTime: ''
        });
        setErrors(prev => ({ ...prev, session: '' }));
    };

    const removeSession = (index: number) => {
        setFormData(prev => ({
            ...prev,
            schedule: prev.schedule.filter((_, i) => i !== index)
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.subjectId) {
            newErrors.subjectId = 'Debe seleccionar una asignatura';
        }

        if (!formData.groupNumber || formData.groupNumber < 1) {
            newErrors.groupNumber = 'El número de grupo debe ser mayor a 0';
        }

        if (!formData.capacity || formData.capacity < 1) {
            newErrors.capacity = 'La capacidad debe ser mayor a 0';
        }

        if (formData.schedule.length === 0) {
            newErrors.schedule = 'Debe agregar al menos una sesión de horario';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error en formulario:', error);
        }
    };

    return (
        <FormModal
            isOpen={isOpen}
            title={group ? 'Editar Grupo' : 'Nuevo Grupo'}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={group ? 'Actualizar' : 'Crear'}
            size="large"
        >
            <div className="form-row">
                <div className="form-group form-group--flex2">
                    <label htmlFor="subjectId">Asignatura *</label>
                    <select
                        id="subjectId"
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleChange}
                        disabled={loading || !!group}
                    >
                        <option value={0}>Seleccionar asignatura...</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                                {subject.code} - {subject.name}
                            </option>
                        ))}
                    </select>
                    {errors.subjectId && <span className="form-error">{errors.subjectId}</span>}
                </div>

                <div className="form-group form-group--flex1">
                    <label htmlFor="groupNumber">Número *</label>
                    <input
                        type="number"
                        id="groupNumber"
                        name="groupNumber"
                        value={formData.groupNumber}
                        onChange={handleChange}
                        min="1"
                        disabled={loading}
                    />
                    {errors.groupNumber && <span className="form-error">{errors.groupNumber}</span>}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group form-group--flex2">
                    <label htmlFor="teacherId">Profesor</label>
                    <select
                        id="teacherId"
                        name="teacherId"
                        value={formData.teacherId || ''}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        <option value="">Sin asignar</option>
                        {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group form-group--flex1">
                    <label htmlFor="capacity">Capacidad *</label>
                    <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        disabled={loading}
                    />
                    {errors.capacity && <span className="form-error">{errors.capacity}</span>}
                </div>
            </div>

            <div className="form-section">
                <h3 className="form-section__title">Horario del Grupo</h3>

                {/* Lista de sesiones actuales */}
                {formData.schedule.length > 0 && (
                    <div className="sessions-list">
                        {formData.schedule.map((session, index) => (
                            <div key={index} className="session-item">
                                <span>
                                    {DAYS_OF_WEEK.find(d => d.value === session.dayOfWeek)?.label} {' '}
                                    {session.startTime} - {session.endTime}
                                </span>
                                <button
                                    type="button"
                                    className="session-item__remove"
                                    onClick={() => removeSession(index)}
                                    disabled={loading}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Formulario para agregar nueva sesión */}
                <div className="add-session">
                    <div className="form-row">
                        <div className="form-group form-group--flex1">
                            <label htmlFor="dayOfWeek">Día</label>
                            <select
                                id="dayOfWeek"
                                name="dayOfWeek"
                                value={newSession.dayOfWeek}
                                onChange={handleSessionChange}
                                disabled={loading}
                            >
                                {DAYS_OF_WEEK.map(day => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group form-group--flex1">
                            <label htmlFor="startTime">Hora inicio</label>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={newSession.startTime}
                                onChange={handleSessionChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group form-group--flex1">
                            <label htmlFor="endTime">Hora fin</label>
                            <input
                                type="time"
                                id="endTime"
                                name="endTime"
                                value={newSession.endTime}
                                onChange={handleSessionChange}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="button"
                            className="add-session__button"
                            onClick={addSession}
                            disabled={loading}
                        >
                            + Agregar
                        </button>
                    </div>
                </div>

                {errors.schedule && <span className="form-error">{errors.schedule}</span>}
                {errors.session && <span className="form-error">{errors.session}</span>}
            </div>

            <div className="form-info">
                <small>
                    <strong>Notas:</strong><br />
                    • El profesor puede asignarse después de crear el grupo<br />
                    • El horario debe configurarse sin solapamientos<br />
                    • La capacidad puede modificarse mientras el grupo esté PLANIFICADO
                </small>
            </div>
        </FormModal>
    );
};