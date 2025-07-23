// src/components/common/WeeklySchedule.tsx
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import './WeeklySchedule.css';

/**
 * Tipo de sesión genérica para el componente de horario
 */
export interface ScheduleSession {
    id: number | string;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
    classroom: string;
    title?: string;
    subtitle?: string;
    color?: string;
}

/**
 * Props del componente WeeklySchedule
 */
export interface WeeklyScheduleProps {
    sessions: ScheduleSession[];
    startHour?: number;
    endHour?: number;
    showWeekends?: boolean;
    height?: string;
    sessionColor?: string;
    onSessionClick?: (session: ScheduleSession) => void;
}

/**
 * Componente reutilizable para mostrar un horario semanal con sesiones.
 * Utiliza FullCalendar para una visualización profesional y confiable.
 */
export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
                                                                  sessions,
                                                                  startHour = 8,
                                                                  endHour = 22,
                                                                  showWeekends = true,
                                                                  height = '600px',
                                                                  sessionColor = '#6366f1',
                                                                  onSessionClick
                                                              }) => {
    // Mapeo de días de la semana
    const dayOfWeekMap: Record<string, number> = {
        'SUNDAY': 0,
        'MONDAY': 1,
        'TUESDAY': 2,
        'WEDNESDAY': 3,
        'THURSDAY': 4,
        'FRIDAY': 5,
        'SATURDAY': 6
    };

    // Convertir sesiones al formato de FullCalendar
    const events = sessions.map(session => {
        // Obtener el día actual (domingo de esta semana)
        const today = new Date();
        const currentDay = today.getDay();
        const sundayOfWeek = new Date(today);
        sundayOfWeek.setDate(today.getDate() - currentDay);

        // Calcular la fecha de la sesión en esta semana
        const sessionDay = dayOfWeekMap[session.dayOfWeek];
        const sessionDate = new Date(sundayOfWeek);
        sessionDate.setDate(sundayOfWeek.getDate() + sessionDay);

        // Crear las fechas de inicio y fin
        const [startHour, startMinute] = session.startTime.split(':').map(Number);
        const [endHour, endMinute] = session.endTime.split(':').map(Number);

        const start = new Date(sessionDate);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(sessionDate);
        end.setHours(endHour, endMinute, 0, 0);

        return {
            id: session.id.toString(),
            title: session.title || 'Sesión',
            start: start,
            end: end,
            backgroundColor: session.color || sessionColor,
            borderColor: session.color || sessionColor,
            extendedProps: {
                subtitle: session.subtitle,
                classroom: session.classroom,
                originalSession: session
            }
        };
    });

    // Manejar click en evento
    const handleEventClick = (clickInfo: any) => {
        if (onSessionClick) {
            const originalSession = clickInfo.event.extendedProps.originalSession;
            onSessionClick(originalSession);
        }
    };

    // Renderizar contenido personalizado del evento
    const renderEventContent = (eventInfo: any) => {
        const { event } = eventInfo;
        const { extendedProps } = event;

        return (
            <div className="fc-event-content-custom">
                <div className="fc-event-time">
                    {eventInfo.timeText}
                </div>
                <div className="fc-event-title">
                    {event.title}
                </div>
                {extendedProps.subtitle && (
                    <div className="fc-event-subtitle">
                        {extendedProps.subtitle}
                    </div>
                )}
                <div className="fc-event-classroom">
                    📍 {extendedProps.classroom}
                </div>
            </div>
        );
    };

    return (
        <div className="weekly-schedule" style={{ height }}>
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale={esLocale}
                height="100%"
                headerToolbar={false}
                weekends={showWeekends}
                slotMinTime={`${startHour.toString().padStart(2, '0')}:00:00`}
                slotMaxTime={`${endHour.toString().padStart(2, '0')}:00:00`}
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
                allDaySlot={false}
                dayHeaderFormat={{ weekday: 'long' }}
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                eventDisplay="block"
                dayHeaderClassNames="fc-col-header-cell-custom"
                slotLabelClassNames="fc-timegrid-slot-label-custom"
                nowIndicator={false}
                expandRows={true}
                stickyHeaderDates={true}
                eventInteractive={true}
                eventMouseEnter={(info) => {
                    info.el.style.transform = 'scale(1.02)';
                    info.el.style.zIndex = '10';
                }}
                eventMouseLeave={(info) => {
                    info.el.style.transform = 'scale(1)';
                    info.el.style.zIndex = '1';
                }}
            />
        </div>
    );
};