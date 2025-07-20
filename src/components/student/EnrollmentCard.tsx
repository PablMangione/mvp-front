// src/components/student/EnrollmentCard.tsx
import React from 'react';
import type { EnrollmentSummary } from '../../types/student.types';
import './EnrollmentCard.css';

interface EnrollmentCardProps {
    enrollment: EnrollmentSummary;
    onCancel?: (enrollmentId: number) => void;
    onPay?: (enrollmentId: number) => void;
    isProcessing?: boolean;
}

/**
 * Componente reutilizable para mostrar una inscripción
 * Extrae la lógica de presentación de la página Enrollments
 */
export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
                                                                  enrollment,
                                                                  onCancel,
                                                                  onPay,
                                                                  isProcessing = false
                                                              }) => {
    const getPaymentStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return { label: 'Pagado', className: 'paid', icon: '✓' };
            case 'PENDING':
                return { label: 'Pendiente', className: 'pending', icon: '⏳' };
            case 'FAILED':
                return { label: 'Fallido', className: 'failed', icon: '✗' };
            default:
                return { label: status, className: '', icon: '?' };
        }
    };

    const getGroupTypeInfo = (type: string) => {
        return type === 'REGULAR'
            ? { label: 'Regular', className: 'regular' }
            : { label: 'Intensivo', className: 'intensive' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const paymentStatus = getPaymentStatusInfo(enrollment.paymentStatus);
    const groupType = getGroupTypeInfo(enrollment.groupType);

    return (
        <div className="enrollment-card">
            <div className="enrollment-card__header">
                <div className="enrollment-card__title-section">
                    <h3 className="enrollment-card__title">{enrollment.subjectName}</h3>
                    <span className={`enrollment-card__group-type ${groupType.className}`}>
                        {groupType.label}
                    </span>
                </div>
                <span className={`enrollment-card__status ${paymentStatus.className}`}>
                    <span className="enrollment-card__status-icon">{paymentStatus.icon}</span>
                    {paymentStatus.label}
                </span>
            </div>

            <div className="enrollment-card__content">
                <div className="enrollment-card__info-row">
                    <span className="enrollment-card__label">Profesor:</span>
                    <span className="enrollment-card__value">{enrollment.teacherName}</span>
                </div>

                <div className="enrollment-card__info-row">
                    <span className="enrollment-card__label">Horario:</span>
                    <span className="enrollment-card__value">{enrollment.schedule}</span>
                </div>

                <div className="enrollment-card__info-row">
                    <span className="enrollment-card__label">Inscrito el:</span>
                    <span className="enrollment-card__value">
                        {formatDate(enrollment.enrollmentDate)}
                    </span>
                </div>
            </div>

            <div className="enrollment-card__actions">
                {enrollment.paymentStatus === 'PENDING' && onPay && (
                    <button
                        className="enrollment-card__btn enrollment-card__btn--primary"
                        onClick={() => onPay(enrollment.id)}
                        disabled={isProcessing}
                    >
                        Pagar Ahora
                    </button>
                )}

                {enrollment.paymentStatus === 'FAILED' && onPay && (
                    <button
                        className="enrollment-card__btn enrollment-card__btn--warning"
                        onClick={() => onPay(enrollment.id)}
                        disabled={isProcessing}
                    >
                        Reintentar Pago
                    </button>
                )}

                {onCancel && (
                    <button
                        className="enrollment-card__btn enrollment-card__btn--danger"
                        onClick={() => onCancel(enrollment.id)}
                        disabled={isProcessing}
                    >
                        Cancelar Inscripción
                    </button>
                )}
            </div>
        </div>
    );
};