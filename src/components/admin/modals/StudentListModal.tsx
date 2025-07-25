import React from 'react';
import { createPortal } from 'react-dom';
import './StudentListModal.css';

interface StudentListModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: any[];
    groupName: string;
}

export const StudentListModal: React.FC<StudentListModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      students,
                                                                      groupName
                                                                  }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal student-list-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal__header">
                    <h2 className="modal__title">
                        Estudiantes de {groupName}
                    </h2>
                    <button
                        className="modal__close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal__content">
                    {students.length === 0 ? (
                        <p className="empty-message">
                            No hay estudiantes inscritos en este grupo.
                        </p>
                    ) : (
                        <div className="student-list">
                            <table className="student-list__table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Carrera</th>
                                </tr>
                                </thead>
                                <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.major}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button
                        className="btn btn--secondary"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};