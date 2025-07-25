// src/components/admin/modals/SessionModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DAYS_OF_WEEK, CLASSROOMS } from '../../../constants/enums';
import './SessionModal.css';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sessionData: any) => void;
    groupId?: number;
    existingSessions?: any[];
    saving?: boolean;
}

// Presets de horarios comunes
const TIME_PRESETS = [
    { label: '9:00', value: '09:00' },
    { label: '10:30', value: '10:30' },
    { label: '12:00', value: '12:00' },
    { label: '16:00', value: '16:00' },
    { label: '17:30', value: '17:30' },
    { label: '19:00', value: '19:00' }
];

// Duraciones comunes en minutos
const DURATION_OPTIONS = [
    { label: '1 hora', value: 60 },
    { label: '1.5 horas', value: 90 },
    { label: '2 horas', value: 120 },
    { label: '2.5 horas', value: 150 },
    { label: '3 horas', value: 180 }
];

export const SessionModal: React.FC<SessionModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSave,
                                                              groupId,
                                                              existingSessions = [],
                                                              saving = false
                                                          }) => {
    const [sessionData, setSessionData] = useState({
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '11:00:00',
        classroom: ''
    });

    const [duration, setDuration] = useState(120); // 2 horas por defecto

    // Calcular hora de fin cuando cambia la hora de inicio o duración
    useEffect(() => {
        const [hours, minutes] = sessionData.startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;

        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;

        if (endHours < 24) { // Solo actualizar si no pasa de medianoche
            const newEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;
            setSessionData(prev => ({ ...prev, endTime: newEndTime }));
        }
    }, [sessionData.startTime, duration]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionData.classroom) {
            alert('Por favor seleccione un aula');
            return;
        }

        onSave(sessionData);
    };

    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        const timeValue = value.includes(':') && value.split(':').length === 2
            ? `${value}:00`
            : value;

        setSessionData(prev => ({
            ...prev,
            [field]: timeValue
        }));

        // Si cambia la hora de fin, recalcular duración
        if (field === 'endTime') {
            const [startHours, startMinutes] = sessionData.startTime.split(':').map(Number);
            const [endHours, endMinutes] = value.split(':').map(Number);

            const startTotalMinutes = startHours * 60 + startMinutes;
            const endTotalMinutes = endHours * 60 + endMinutes;

            const newDuration = endTotalMinutes - startTotalMinutes;
            if (newDuration > 0) {
                setDuration(newDuration);
            }
        }
    };

    const adjustTime = (field: 'startTime' | 'endTime', increment: boolean, unit: 'hour' | 'minute') => {
        const currentTime = sessionData[field].substring(0, 5);
        const [hours, minutes] = currentTime.split(':').map(Number);

        let newHours = hours;
        let newMinutes = minutes;

        if (unit === 'hour') {
            newHours = increment ? (hours + 1) % 24 : (hours - 1 + 24) % 24;
        } else {
            // Incrementar/decrementar de 15 en 15 minutos
            const step = 15;
            if (increment) {
                newMinutes = Math.floor(minutes / step) * step + step;
                if (newMinutes >= 60) {
                    newMinutes = 0;
                    newHours = (hours + 1) % 24;
                }
            } else {
                newMinutes = minutes % step === 0 ? minutes - step : Math.floor(minutes / step) * step;
                if (newMinutes < 0) {
                    newMinutes = 60 - step;
                    newHours = (hours - 1 + 24) % 24;
                }
            }
        }

        const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        handleTimeChange(field, formattedTime);
    };

    const applyPreset = (presetValue: string) => {
        handleTimeChange('startTime', presetValue);
    };

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) return `${mins} minutos`;
        if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
        return `${hours} hora${hours > 1 ? 's' : ''} ${mins} minutos`;
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal session-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h2 className="modal__title">Agregar Nueva Sesión</h2>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal__content">
                    <div className="form-group">
                        <label htmlFor="dayOfWeek">Día de la semana</label>
                        <select
                            id="dayOfWeek"
                            name="dayOfWeek"
                            className="form-control"
                            value={sessionData.dayOfWeek}
                            onChange={(e) => setSessionData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                            disabled={saving}
                        >
                            {DAYS_OF_WEEK.map(day => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Horario</label>

                        {/* Presets de horarios comunes */}
                        <div className="time-presets">
                            {TIME_PRESETS.map(preset => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    className="time-preset-btn"
                                    onClick={() => applyPreset(preset.value)}
                                    disabled={saving}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <div className="time-inputs-row">
                            {/* Hora de inicio */}
                            <div className="time-input-group">
                                <label htmlFor="startTime">Inicio</label>
                                <div className="time-input-wrapper">
                                    <input
                                        type="time"
                                        id="startTime"
                                        className="form-control"
                                        value={sessionData.startTime.substring(0, 5)}
                                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                        disabled={saving}
                                    />
                                    <div className="time-adjusters">
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('startTime', true, 'hour')}
                                            disabled={saving}
                                            title="Aumentar hora"
                                        >
                                            H+
                                        </button>
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('startTime', false, 'hour')}
                                            disabled={saving}
                                            title="Disminuir hora"
                                        >
                                            H-
                                        </button>
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('startTime', true, 'minute')}
                                            disabled={saving}
                                            title="Aumentar minutos"
                                        >
                                            M+
                                        </button>
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('startTime', false, 'minute')}
                                            disabled={saving}
                                            title="Disminuir minutos"
                                        >
                                            M-
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Duración */}
                            <div className="duration-group">
                                <label htmlFor="duration">Duración</label>
                                <select
                                    id="duration"
                                    className="form-control"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    disabled={saving}
                                >
                                    {DURATION_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Hora de fin */}
                            <div className="time-input-group">
                                <label htmlFor="endTime">Fin</label>
                                <div className="time-input-wrapper">
                                    <input
                                        type="time"
                                        id="endTime"
                                        className="form-control"
                                        value={sessionData.endTime.substring(0, 5)}
                                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                        disabled={saving}
                                    />
                                    <div className="time-adjusters">
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('endTime', true, 'hour')}
                                            disabled={saving}
                                            title="Aumentar hora"
                                        >
                                            H+
                                        </button>
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('endTime', false, 'hour')}
                                            disabled={saving}
                                            title="Disminuir hora"
                                        >
                                            H-
                                        </button>
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('endTime', true, 'minute')}
                                            disabled={saving}
                                            title="Aumentar minutos"
                                        >
                                            M+
                                        </button>
                                        <button
                                            type="button"
                                            className="time-adjuster"
                                            onClick={() => adjustTime('endTime', false, 'minute')}
                                            disabled={saving}
                                            title="Disminuir minutos"
                                        >
                                            M-
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Indicador visual de duración */}
                        <div className="duration-indicator">
                            <span className="duration-text">
                                Sesión de {formatDuration(duration)}
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="classroom">Aula</label>
                        <select
                            id="classroom"
                            name="classroom"
                            className="form-control"
                            value={sessionData.classroom}
                            onChange={(e) => setSessionData(prev => ({ ...prev, classroom: e.target.value }))}
                            disabled={saving}
                            required
                        >
                            <option value="">Seleccione un aula...</option>
                            {CLASSROOMS.map(classroom => (
                                <option key={classroom.value} value={classroom.value}>
                                    {classroom.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal__footer">
                        <button
                            type="button"
                            className="btn btn--secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn--primary"
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Agregar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};