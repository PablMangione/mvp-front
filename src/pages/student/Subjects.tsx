import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../api/student.api';
import type {Subject, CourseGroup} from '../../types/student.types';
import './Subjects.css';

export const Subjects: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
            const data = await studentApi.getMySubjects();
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
            const groups = await studentApi.getSubjectGroups(subject.id);
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
            await studentApi.enrollInGroup(selectedSubject.id, groupId);
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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Filtrar asignaturas por año
    const filteredSubjects = selectedYear === 'all'
        ? subjects
        : subjects.filter(s => s.courseYear === selectedYear);

    // Obtener años únicos
    const uniqueYears = [...new Set(subjects.map(s => s.courseYear))].sort();

    const getDayName = (day: string): string => {
        const days: Record<string, string> = {
            'MONDAY': 'Lunes',
            'TUESDAY': 'Martes',
            'WEDNESDAY': 'Miércoles',
            'THURSDAY': 'Jueves',
            'FRIDAY': 'Viernes',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };
        return days[day] || day;
    };

    return (
        <div className="subjects-container">
            <header className="subjects-header">
                <div className="header-content">
                    <h1>ACAInfo - Asignaturas</h1>
                    <div className="header-actions">
                        <span className="user-name">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <nav className="subjects-nav">
                <ul>
                    <li>
                        <a href="#" onClick={() => navigate('/student/dashboard')} className="nav-link">
                            Inicio
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link active">Asignaturas</a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/enrollments')} className="nav-link">
                            Mis Inscripciones
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/profile')} className="nav-link">
                            Mi Perfil
                        </a>
                    </li>
                </ul>
            </nav>

            <main className="subjects-main">
                <div className="subjects-header-section">
                    <h2>Asignaturas de {user?.major}</h2>
                    <div className="year-filter">
                        <label>Filtrar por año:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">Todos los años</option>
                            {uniqueYears.map(year => (
                                <option key={year} value={year}>Año {year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando asignaturas...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="subjects-grid">
                        {filteredSubjects.map(subject => (
                            <div
                                key={subject.id}
                                className={`subject-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                                onClick={() => fetchSubjectGroups(subject)}
                            >
                                <h3>{subject.name}</h3>
                                <p className="subject-year">Año {subject.courseYear}</p>
                                <button className="view-groups-btn">
                                    Ver grupos disponibles
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {selectedSubject && (
                    <div className="groups-section">
                        <h3>Grupos disponibles para: {selectedSubject.name}</h3>

                        {enrollmentStatus && (
                            <div className={`enrollment-status ${enrollmentStatus.includes('exitosa') ? 'success' : 'error'}`}>
                                {enrollmentStatus}
                            </div>
                        )}

                        {loadingGroups ? (
                            <div className="loading">Cargando grupos...</div>
                        ) : subjectGroups.length === 0 ? (
                            <div className="no-groups">
                                <p>No hay grupos disponibles para esta asignatura.</p>
                                <button
                                    className="request-group-btn"
                                    onClick={() => navigate('/student/group-requests')}
                                >
                                    Solicitar apertura de grupo
                                </button>
                            </div>
                        ) : (
                            <div className="groups-grid">
                                {subjectGroups.map(group => (
                                    <div key={group.id} className="group-card">
                                        <div className="group-header">
                                            <h4>{group.type === 'REGULAR' ? 'Grupo Regular' : 'Grupo Intensivo'}</h4>
                                            <span className={`group-status ${group.status.toLowerCase()}`}>
                        {group.status === 'ACTIVE' ? 'Activo' :
                            group.status === 'PLANNED' ? 'Planificado' : 'Cerrado'}
                      </span>
                                        </div>

                                        <div className="group-info">
                                            <p><strong>Profesor:</strong> {group.teacherName}</p>
                                            <p><strong>Precio:</strong> ${group.price}</p>
                                            <p><strong>Capacidad:</strong> {group.enrolledStudents}/{group.maxCapacity}</p>
                                        </div>

                                        {group.sessions && group.sessions.length > 0 && (
                                            <div className="group-schedule">
                                                <p><strong>Horario:</strong></p>
                                                {group.sessions.map((session, idx) => (
                                                    <p key={idx} className="session-info">
                                                        {getDayName(session.dayOfWeek)} {session.startTime} - {session.endTime}
                                                        {session.classroom && ` (${session.classroom})`}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        <button
                                            className="enroll-btn"
                                            disabled={
                                                group.status !== 'ACTIVE' ||
                                                group.enrolledStudents >= group.maxCapacity
                                            }
                                            onClick={() => handleEnrollment(group.id)}
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
            </main>
        </div>
    );
};