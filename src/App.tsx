// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { StudentLayout } from './components/student/StudentLayout';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import { Profile } from './pages/student/Profile';
import { Enrollments } from './pages/student/Enrollment';
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

                    {/* Rutas protegidas para estudiantes - REFACTORIZADO */}
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                        {/* StudentLayout envuelve todas las rutas del estudiante */}
                        <Route element={<StudentLayout />}>
                            <Route path="/student/dashboard" element={<StudentDashboard />} />
                            <Route path="/student/subjects" element={<Subjects />} />
                            <Route path="/student/profile" element={<Profile />} />
                            <Route path="/student/enrollments" element={<Enrollments />} />
                            <Route path="/student/group-requests" element={<GroupRequests />} />
                        </Route>
                    </Route>

                    {/* Rutas protegidas para profesores */}
                    <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
                        {/* <Route path="/teacher/dashboard" element={<TeacherDashboard />} /> */}
                    </Route>

                    {/* Rutas protegidas para administradores */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;