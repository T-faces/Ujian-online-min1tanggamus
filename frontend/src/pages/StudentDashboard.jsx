import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Home, FileText, Clock, LogOut } from 'lucide-react';

import StudentHome from './student/StudentHome';
import AvailableExams from './student/AvailableExams';
import ExamHistory from './student/ExamHistory';

const StudentDashboard = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/student', icon: Home, label: 'Beranda', exact: true },
    { path: '/student/exams', icon: FileText, label: 'Ujian Tersedia' },
    { path: '/student/history', icon: Clock, label: 'Riwayat' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-500 to-green-500 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold" data-testid="student-sidebar-title">Dashboard Siswa</h2>
          <p className="text-blue-100 text-sm mt-1" data-testid="student-user-name">{user.name}</p>
          {user.class_name && <p className="text-blue-100 text-xs" data-testid="student-class">Kelas {user.class_name}</p>}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'hover:bg-blue-600'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Button
          onClick={onLogout}
          data-testid="student-logout-btn"
          variant="outline"
          className="w-full flex items-center gap-2 border-white text-white hover:bg-white hover:text-blue-600"
        >
          <LogOut size={20} />
          Keluar
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route index element={<StudentHome user={user} />} />
          <Route path="exams" element={<AvailableExams />} />
          <Route path="history" element={<ExamHistory />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;