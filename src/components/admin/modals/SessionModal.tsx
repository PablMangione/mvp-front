import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './SessionModal.css';

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sessionData: any) => void;
    groupId: number;
    saving?: boolean;
}

const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
];

export const SessionModal: React.FC<SessionModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSave,
                                                              groupId,
                                                              saving = false
                                                          }) => {
    const [sessionData, setSessionData] = useState({
        dayOfWeek: 'MONDAY',
        startTime: '09:00:00',
        endTime: '11:00:00',
        classroom: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionData.classroom.trim()) {
            alert('El aula es requerida');
            return;
        }

        onSave({
            ...sessionData,
            classroom: sessionData.classroom.trim()
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSessionData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función mejorada para manejar el cambio de tiempo
    const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
        // Asegurar que el valor tenga segundos
        const timeValue = value.includes(':') && value.split(':').length === 2
            ? `${value}:00`
            : value;

        setSessionData(prev => ({
            ...prev,
            [field]: timeValue
        }));
    };

    // Función para ajustar el tiempo con las flechas
    const adjustTime = (field: 'startTime' | 'endTime', increment: boolean, isHour: boolean) => {
        const currentTime = sessionData[field].substring(0, 5);
        const [hours, minutes] = currentTime.split(':').map(Number);

        let newHours = hours;
        let newMinutes = minutes;

        if (isHour) {
            // Ajustar horas
            if (increment) {
                newHours = (hours + 1) % 24;
            } else {
                newHours = hours - 1;
                if (newHours < 0) newHours = 23;
            }
        } else {
            // Ajustar minutos de 15 en 15
            if (increment) {
                newMinutes = Math.floor(minutes / 15) * 15 + 15;
                if (newMinutes >= 60) {
                    newMinutes = 0;
                    newHours = (hours + 1) % 24;
                }
            } else {
                if (minutes % 15 === 0) {
                    newMinutes = minutes - 15;
                } else {
                    newMinutes = Math.floor(minutes / 15) * 15;
                }
                if (newMinutes < 0) {
                    newMinutes = 45;
                    newHours = hours - 1;
                    if (newHours < 0) newHours = 23;
                }
            }
        }

        const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`;
        setSessionData(prev => ({
            ...prev,
            [field]: formattedTime
        }));
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

                <form onSubmit={handleSubmit}>
                    <div className="modal__content">
                        <div className="form-group">
                            <label htmlFor="dayOfWeek">Día de la Semana</label>
                            <select
                                id="dayOfWeek"
                                name="dayOfWeek"
                                value={sessionData.dayOfWeek}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                {DAYS_OF_WEEK.map(day => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startTime">Hora de Inicio</label>
                                <div className="time-input-wrapper">
                                    <input
                                        type="time"
                                        id="startTime"
                                        name="startTime"
                                        value={sessionData.startTime.substring(0, 5)}
                                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const cursorPosition = input.selectionStart || 0;
                                                const isHourSection = cursorPosition <= 2;
                                                adjustTime('startTime', e.key === 'ArrowUp', isHourSection);
                                            }
                                        }}
                                        className="form-control"
                                        required
                                    />
                                    <div className="time-arrows">
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('startTime', true, true)}
                                            title="Incrementar hora"
                                        >
                                            ↑H
                                        </button>
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('startTime', false, true)}
                                            title="Decrementar hora"
                                        >
                                            ↓H
                                        </button>
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('startTime', true, false)}
                                            title="Incrementar minutos"
                                        >
                                            ↑M
                                        </button>
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('startTime', false, false)}
                                            title="Decrementar minutos"
                                        >
                                            ↓M
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="endTime">Hora de Fin</label>
                                <div className="time-input-wrapper">
                                    <input
                                        type="time"
                                        id="endTime"
                                        name="endTime"
                                        value={sessionData.endTime.substring(0, 5)}
                                        onChange={(e) => handleTimeChange('endTime', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const cursorPosition = input.selectionStart || 0;
                                                const isHourSection = cursorPosition <= 2;
                                                adjustTime('endTime', e.key === 'ArrowUp', isHourSection);
                                            }
                                        }}
                                        className="form-control"
                                        required
                                    />
                                    <div className="time-arrows">
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('endTime', true, true)}
                                            title="Incrementar hora"
                                        >
                                            ↑H
                                        </button>
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('endTime', false, true)}
                                            title="Decrementar hora"
                                        >
                                            ↓H
                                        </button>
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('endTime', true, false)}
                                            title="Incrementar minutos"
                                        >
                                            ↑M
                                        </button>
                                        <button
                                            type="button"
                                            className="time-arrow"
                                            onClick={() => adjustTime('endTime', false, false)}
                                            title="Decrementar minutos"
                                        >
                                            ↓M
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="classroom">Aula</label>
                            <input
                                type="text"
                                id="classroom"
                                name="classroom"
                                value={sessionData.classroom}
                                onChange={handleChange}
                                placeholder="Ej: A101"
                                className="form-control"
                                required
                            />
                        </div>
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