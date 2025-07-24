// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/common';
import { StudentLayout } from './components/student/StudentLayout';
import { AdminLayout } from "./components/admin/AdminLayout";
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import { Profile } from './pages/student/Profile';
import { Enrollments } from './pages/student/Enrollment';
import { Subjects } from './pages/student/Subjects';
import { GroupRequests } from './pages/student/GroupRequest';
import { AdminDashboard } from './pages/admin/Dashboard';
import { SubjectList, SubjectForm, SubjectDetail } from "./components/admin/subjects";
import { GroupList, GroupDetail, GroupForm} from "./components/admin/groups";
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
                        {/* Aquí irán las rutas de profesores cuando se implementen */}
                        {/* <Route path="/teacher/*" element={<TeacherLayout />} /> */}
                    </Route>
                    {/* Rutas protegidas para administradores */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        {/* AdminLayout envuelve todas las rutas del administrador */}
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            {/* Modulo asignaturas */}
                            <Route path="/admin/subjects" element={<SubjectList />} />
                            <Route path="/admin/subjects/new" element={<SubjectForm />} />
                            <Route path="/admin/subjects/:id" element={<SubjectDetail />} />
                            <Route path="/admin/subjects/:id/edit" element={<SubjectForm />} />
                            {/* Modulo grupos*/}
                            <Route path="/admin/groups" element={<GroupList />} />
                            <Route path="/admin/groups/:id" element={<GroupDetail />} />
                            <Route path="/admin/groups/new" element={<GroupForm />} />
                            <Route path="/admin/groups/:id/edit" element={<GroupForm />} />
                        </Route>
                    </Route>
                    {/* Ruta 404 - Página no encontrada */}
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;