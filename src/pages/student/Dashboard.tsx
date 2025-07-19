import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

export const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>ACAInfo - Panel de Estudiante</h1>
                    <div className="header-actions">
                        <span className="user-name">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <nav className="dashboard-nav">
                <ul>
                    <li>
                        <a href="#" className="nav-link active">Inicio</a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/subjects')} className="nav-link">
                            Asignaturas
                        </a>
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

            <main className="dashboard-main">
                <div className="welcome-section">
                    <h2>Bienvenido, {user?.name}!</h2>
                    <p className="student-info">
                        <strong>Email:</strong> {user?.email}<br />
                        <strong>Carrera:</strong> {user?.major}
                    </p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Inscripciones Activas</h3>
                        <p className="card-number">0</p>
                        <p className="card-description">Grupos en los que estás inscrito</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/enrollments')}
                        >
                            Ver Inscripciones
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h3>Asignaturas Disponibles</h3>
                        <p className="card-number">--</p>
                        <p className="card-description">Asignaturas de tu carrera</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/subjects')}
                        >
                            Explorar Asignaturas
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h3>Solicitudes de Grupo</h3>
                        <p className="card-number">0</p>
                        <p className="card-description">Solicitudes pendientes</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/group-requests')}
                        >
                            Ver Solicitudes
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h3>Mi Perfil</h3>
                        <p className="card-description">Actualiza tu información personal</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/profile')}
                        >
                            Editar Perfil
                        </button>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Actividad Reciente</h3>
                    <p className="no-activity">No hay actividad reciente para mostrar.</p>
                </div>
            </main>
        </div>
    );
};