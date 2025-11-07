import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, FileText, Users, LogOut, Plus } from 'lucide-react';

import AdminHome from './admin/AdminHome';
import SubjectsManager from './admin/SubjectsManager';
import ExamsManager from './admin/ExamsManager';
import ResultsViewer from './admin/ResultsViewer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/subjects', icon: BookOpen, label: 'Mata Pelajaran' },
    { path: '/admin/exams', icon: FileText, label: 'Ujian' },
    { path: '/admin/results', icon: Users, label: 'Hasil Ujian' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold" data-testid="admin-sidebar-title">Admin Panel</h2>
          <p className="text-purple-100 text-sm mt-1" data-testid="admin-user-name">{user.name}</p>
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
                    ? 'bg-white text-purple-600 shadow-lg' 
                    : 'hover:bg-purple-700'
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
          data-testid="admin-logout-btn"
          variant="outline"
          className="w-full flex items-center gap-2 border-white text-white hover:bg-white hover:text-purple-600"
        >
          <LogOut size={20} />
          Keluar
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="subjects" element={<SubjectsManager />} />
          <Route path="exams" element={<ExamsManager />} />
          <Route path="results" element={<ResultsViewer />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;