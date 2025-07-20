// src/pages/student/Subjects.tsx
import React, { useState, useEffect } from 'react';
import {subjectService, enrollmentService} from '../../services/student';
import type { Subject, CourseGroup } from '../../types/student.types';
import './Subjects.css';

/**
 * Página de asignaturas - REFACTORIZADA
 * Removido: header, nav y logout (ahora en StudentLayout)
 */
export const Subjects: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [subjectGroups, setSubjectGroups] = useState<CourseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await subjectService.getMySubjects();
            console.log('Subjects fetched:', data); // Debug
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setError('Error al cargar las asignaturas');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjectGroups = async (subject: Subject) => {
        try {
            setLoadingGroups(true);
            setSelectedSubject(subject);
            const groups = await subjectService.getSubjectGroups(subject.id);
            setSubjectGroups(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setSubjectGroups([]);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleEnrollment = async (groupId: number) => {
        if (!selectedSubject) return;

        try {
            setEnrollmentStatus('Procesando inscripción...');
            await enrollmentService.enrollInGroup(selectedSubject.id, groupId);
            setEnrollmentStatus('¡Inscripción exitosa!');

            // Recargar grupos para actualizar contador
            await fetchSubjectGroups(selectedSubject);

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setEnrollmentStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al inscribirse';
            setEnrollmentStatus(errorMessage);
            setTimeout(() => setEnrollmentStatus(null), 5000);
        }
    };

    // Filtrar asignaturas por año
    const filteredSubjects = selectedYear === 'all'
        ? subjects
        : subjects.filter(subject => subject.courseYear === selectedYear);

    // Obtener años únicos
    const availableYears = Array.from(new Set(subjects.map(s => s.courseYear))).sort();

    if (loading) {
        return (
            <div className="subjects-container">
                <div className="loading">Cargando asignaturas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="subjects-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="subjects-container">
            <div className="subjects-content">
                <div className="page-header">
                    <h2>Asignaturas Disponibles</h2>
                    <p className="page-description">
                        Explora las asignaturas de tu carrera y sus grupos disponibles
                    </p>
                </div>

                {/* Filtro por año */}
                <div className="year-filter">
                    <label>Filtrar por año:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="year-select"
                    >
                        <option value="all">Todos los años</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}º año
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de asignaturas */}
                <div className="subjects-grid">
                    {filteredSubjects.length === 0 ? (
                        <div className="no-subjects">
                            No hay asignaturas disponibles para mostrar.
                        </div>
                    ) : (
                        filteredSubjects.map(subject => (
                            <div
                                key={subject.id}
                                className={`subject-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                                onClick={() => fetchSubjectGroups(subject)}
                            >
                                <h3>{subject.name}</h3>
                                <div className="subject-info">
                                    <span className="subject-year">{subject.courseYear}º año</span>
                                    <span className="subject-major">{subject.major}</span>
                                </div>
                                <button className="view-groups-btn">
                                    Ver Grupos Disponibles
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Grupos de la asignatura seleccionada */}
                {selectedSubject && (
                    <div className="groups-section">
                        <h3>Grupos disponibles para: {selectedSubject.name}</h3>

                        {enrollmentStatus && (
                            <div className={`enrollment-status ${enrollmentStatus.includes('Error') ? 'error' : 'success'}`}>
                                {enrollmentStatus}
                            </div>
                        )}

                        {loadingGroups ? (
                            <div className="loading-groups">Cargando grupos...</div>
                        ) : subjectGroups.length === 0 ? (
                            <div className="no-groups">
                                No hay grupos disponibles para esta asignatura.
                            </div>
                        ) : (
                            <div className="groups-grid">
                                {subjectGroups.map(group => (
                                    <div key={group.id} className="group-card">
                                        <div className="group-header">
                                            <h4>Grupo {group.id}</h4>
                                            <span className={`group-status ${group.status.toLowerCase()}`}>
                                                {group.status === 'ACTIVE' ? 'Activo' :
                                                    group.status === 'PLANNED' ? 'Planificado' : 'Cerrado'}
                                            </span>
                                        </div>

                                        <div className="group-details">
                                            <p><strong>Profesor:</strong> {group.teacherName}</p>
                                            <p><strong>Tipo:</strong> {group.type === 'REGULAR' ? 'Regular' : 'Intensivo'}</p>
                                            <p><strong>Precio:</strong> ${group.price}</p>
                                            <p><strong>Cupos:</strong> {group.enrolledStudents}/{group.maxCapacity}</p>
                                        </div>

                                        {/* Horarios si están disponibles */}
                                        {group.sessions && group.sessions.length > 0 && (
                                            <div className="group-schedule">
                                                <strong>Horario:</strong>
                                                {group.sessions.map((session, index) => (
                                                    <div key={index} className="session-info">
                                                        {session.dayOfWeek}: {session.startTime} - {session.endTime}
                                                        <span className="classroom"> ({session.classroom})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            className="enroll-button"
                                            onClick={() => handleEnrollment(group.id)}
                                            disabled={
                                                group.status !== 'ACTIVE' ||
                                                group.enrolledStudents >= group.maxCapacity
                                            }
                                        >
                                            {group.status !== 'ACTIVE' ? 'No disponible' :
                                                group.enrolledStudents >= group.maxCapacity ? 'Grupo lleno' :
                                                    'Inscribirse'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};