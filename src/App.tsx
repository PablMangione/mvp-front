import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import {Profile} from "./pages/student/Profile";
import { Enrollments } from './pages/student/Enrollment'
import { Subjects } from './pages/student/Subjects';
import { GroupRequests } from './pages/student/GroupRequest';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Ruta raíz - redirige inteligentemente */}
                    <Route path="/" element={<Home />} />

                    {/* Rutas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Rutas protegidas para estudiantes */}
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                        <Route path="/student/dashboard" element={<StudentDashboard />} />
                        <Route path="/student/subjects" element={<Subjects />} />
                        { <Route path="/student/profile" element={<Profile />} /> }
                        { <Route path="/student/enrollments" element={<Enrollments />} /> }
                        { <Route path="/student/group-requests" element={<GroupRequests />} /> }
                    </Route>

                    {/* Rutas protegidas para profesores */}
                    <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
                        {/* <Route path="/teacher/dashboard" element={<TeacherDashboard />} /> */}
                    </Route>

                    {/* Rutas protegidas para administradores */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                    </Route>

                    {/* Ruta para acceso no autorizado */}
                    <Route path="/unauthorized" element={
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h1>Acceso No Autorizado</h1>
                            <p>No tienes permisos para acceder a esta página.</p>
                            <a href="/">Volver al inicio</a>
                        </div>
                    } />

                    {/* Ruta 404 */}
                    <Route path="*" element={
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h1>404 - Página no encontrada</h1>
                            <a href="/">Volver al inicio</a>
                        </div>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;