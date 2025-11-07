import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, BookOpen, Users, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/admin`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>;
  }

  const statCards = [
    { label: 'Total Ujian', value: stats?.total_exams || 0, icon: FileText, color: 'from-pink-400 to-pink-600', testId: 'stat-exams' },
    { label: 'Mata Pelajaran', value: stats?.total_subjects || 0, icon: BookOpen, color: 'from-blue-400 to-blue-600', testId: 'stat-subjects' },
    { label: 'Total Siswa', value: stats?.total_students || 0, icon: Users, color: 'from-purple-400 to-purple-600', testId: 'stat-students' },
    { label: 'Ujian Selesai', value: stats?.total_submissions || 0, icon: CheckCircle, color: 'from-green-400 to-green-600', testId: 'stat-submissions' },
  ];

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold text-gray-800 mb-8" data-testid="admin-home-title">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-6 card-hover" data-testid={stat.testId}>
            <div className={`bg-gradient-to-br ${stat.color} w-14 h-14 rounded-full flex items-center justify-center mb-4`}>
              <stat.icon className="text-white" size={28} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Selamat Datang! 👋</h2>
        <p className="text-gray-600 mb-4">
          Gunakan menu di sebelah kiri untuk mengelola mata pelajaran, membuat ujian, dan melihat hasil ujian siswa.
        </p>
        <div className="space-y-2 text-gray-700">
          <p>• <strong>Mata Pelajaran:</strong> Tambah dan kelola mata pelajaran</p>
          <p>• <strong>Ujian:</strong> Buat ujian baru dengan soal pilihan ganda dan essay</p>
          <p>• <strong>Hasil Ujian:</strong> Lihat performa siswa</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;