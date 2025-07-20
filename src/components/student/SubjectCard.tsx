// src/components/student/SubjectCard.tsx
import React from 'react';
import type { Subject } from '../../types/student.types';
import './SubjectCard.css';

interface SubjectCardProps {
    subject: Subject;
    isSelected?: boolean;
    onClick?: (subject: Subject) => void;
    showActions?: boolean;
}

/**
 * Componente reutilizable para mostrar información de una asignatura
 * Extrae la lógica de presentación de la página Subjects
 */
export const SubjectCard: React.FC<SubjectCardProps> = ({
                                                            subject,
                                                            isSelected = false,
                                                            onClick,
                                                            showActions = true
                                                        }) => {
    const handleClick = () => {
        if (onClick) {
            onClick(subject);
        }
    };

    return (
        <div
            className={`subject-card ${isSelected ? 'selected' : ''}`}
            onClick={handleClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className="subject-card__header">
                <h3 className="subject-card__title">{subject.name}</h3>
                <span className="subject-card__year-badge">
                    {subject.courseYear}º año
                </span>
            </div>

            <div className="subject-card__content">
                <p className="subject-card__major">
                    <span className="subject-card__label">Carrera:</span>
                    <span className="subject-card__value">{subject.major}</span>
                </p>
            </div>

            {showActions && onClick && (
                <div className="subject-card__actions">
                    <button
                        className="subject-card__action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        Ver Grupos Disponibles
                    </button>
                </div>
            )}
        </div>
    );
};