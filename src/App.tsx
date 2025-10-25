import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ApplicantDashboard } from './components/ApplicantDashboard';
import { SchoolAdminLoginPage } from './components/SchoolAdminLoginPage';
import { SchoolAdminRegisterPage } from './components/SchoolAdminRegisterPage';
import { SchoolAdminDashboard } from './components/SchoolAdminDashboard';

export type UserRole = 'guest' | 'applicant' | 'admin' | 'school-admin';
export type SchoolLevel = 'TK' | 'SD' | 'SMP' | 'SMA';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  school?: SchoolLevel;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'school-admin-login' | 'school-admin-register'>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' && (
        <LandingPage 
          onNavigateLogin={() => setCurrentPage('login')}
          onNavigateRegister={() => setCurrentPage('register')}
          onNavigateSchoolAdminLogin={() => setCurrentPage('school-admin-login')}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onNavigateRegister={() => setCurrentPage('register')}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      
      {currentPage === 'register' && (
        <RegisterPage 
          onRegister={handleRegister}
          onNavigateLogin={() => setCurrentPage('login')}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      
      {currentPage === 'school-admin-login' && (
        <SchoolAdminLoginPage 
          onLogin={handleLogin}
          onNavigateRegister={() => setCurrentPage('school-admin-register')}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      
      {currentPage === 'school-admin-register' && (
        <SchoolAdminRegisterPage 
          onRegister={handleRegister}
          onNavigateLogin={() => setCurrentPage('school-admin-login')}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      
      {currentPage === 'dashboard' && user && (
        <>
          {user.role === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : user.role === 'school-admin' ? (
            <SchoolAdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <ApplicantDashboard user={user} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}
