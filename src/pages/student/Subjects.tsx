// src/pages/student/Subjects.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectService, enrollmentService } from '../../services/student';
import { SubjectCard } from '../../components/student/SubjectCard';
import { GroupCard } from '../../components/student/GroupCard';
import type { Subject, CourseGroup } from '../../types/student.types';
import './Subjects.css';

/**
 * Página de asignaturas - REFACTORIZADA con componentes reutilizables
 */
export const Subjects: React.FC = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [subjectGroups, setSubjectGroups] = useState<CourseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [enrollingGroupId, setEnrollingGroupId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await subjectService.getMySubjects();
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
            setEnrollingGroupId(groupId);
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
        } finally {
            setEnrollingGroupId(null);
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
                    <label htmlFor="year-select">Filtrar por año:</label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value));
                            setSelectedSubject(null);
                            setSubjectGroups([]);
                        }}
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

                {/* Lista de asignaturas usando SubjectCard */}
                <div className="subjects-grid">
                    {filteredSubjects.length === 0 ? (
                        <div className="no-subjects">
                            No hay asignaturas disponibles para mostrar.
                        </div>
                    ) : (
                        filteredSubjects.map(subject => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                isSelected={selectedSubject?.id === subject.id}
                                onClick={fetchSubjectGroups}
                            />
                        ))
                    )}
                </div>

                {/* Grupos de la asignatura seleccionada */}
                {selectedSubject && (
                    <div className="groups-section">
                        <div className="groups-section-header">
                            <h3>Grupos disponibles para: {selectedSubject.name}</h3>
                            <button
                                className="close-groups-btn"
                                onClick={() => {
                                    setSelectedSubject(null);
                                    setSubjectGroups([]);
                                }}
                                aria-label="Cerrar sección de grupos"
                            >
                                ✕
                            </button>
                        </div>

                        {enrollmentStatus && (
                            <div className={`enrollment-status ${enrollmentStatus.includes('Error') ? 'error' : 'success'}`}>
                                {enrollmentStatus}
                            </div>
                        )}

                        {loadingGroups ? (
                            <div className="loading-groups">Cargando grupos...</div>
                        ) : subjectGroups.length === 0 ? (
                            <div className="no-groups">
                                <p>No hay grupos disponibles para esta asignatura.</p>
                                <button
                                    className="request-group-btn"
                                    onClick={() => {
                                        navigate('/student/group-requests', {
                                            state: {
                                                createNew: true,
                                                selectedSubjectId: selectedSubject.id
                                            }
                                        });
                                    }}
                                >
                                    Solicitar apertura de grupo
                                </button>
                            </div>
                        ) : (
                            <div className="groups-grid">
                                {subjectGroups.map(group => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        onEnroll={handleEnrollment}
                                        isEnrolling={enrollingGroupId === group.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};