import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/auth/Login';
// import { Register } from './pages/auth/Register';
// import { StudentDashboard } from './pages/student/Dashboard';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/login" element={<Login />} />
                    {/* <Route path="/register" element={<Register />} /> */}

                    {/* Ruta raíz - redirige según autenticación */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Rutas protegidas para estudiantes */}
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                        {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
                        {/* <Route path="/student/profile" element={<StudentProfile />} /> */}
                        {/* <Route path="/student/subjects" element={<StudentSubjects />} /> */}
                    </Route>

                    {/* Rutas protegidas para profesores */}
                    <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
                        {/* <Route path="/teacher/dashboard" element={<TeacherDashboard />} /> */}
                    </Route>

                    {/* Rutas protegidas para administradores */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                    </Route>

                    {/* Ruta 404 */}
                    <Route path="*" element={<div>404 - Página no encontrada</div>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;