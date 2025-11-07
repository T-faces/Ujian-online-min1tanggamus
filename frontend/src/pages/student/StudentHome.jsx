import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, TrendingUp, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentHome = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/student`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  const statCards = [
    { label: 'Ujian Selesai', value: stats?.completed_exams || 0, icon: CheckCircle, color: 'from-green-400 to-green-600', testId: 'stat-completed' },
    { label: 'Sedang Dikerjakan', value: stats?.in_progress || 0, icon: TrendingUp, color: 'from-orange-400 to-orange-600', testId: 'stat-progress' },
    { label: 'Rata-rata Nilai', value: stats?.average_score ? `${stats.average_score}%` : '0%', icon: Award, color: 'from-purple-400 to-purple-600', testId: 'stat-average' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2" data-testid="student-home-title">Halo, {user.name}! 👋</h1>
        <p className="text-gray-600 text-lg">Selamat datang di dashboard ujian online kamu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">📚 Mulai Ujian</h3>
          <p className="mb-4 text-purple-100">Lihat ujian yang tersedia dan mulai mengerjakan untuk meningkatkan nilaimu!</p>
          <a href="/student/exams" className="inline-block bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors">
            Lihat Ujian
          </a>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">📈 Riwayat Ujian</h3>
          <p className="mb-4 text-blue-100">Pantau perkembangan belajarmu dengan melihat hasil ujian sebelumnya.</p>
          <a href="/student/history" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
            Lihat Riwayat
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tips Mengerjakan Ujian 🎯</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Baca soal dengan teliti sebelum menjawab</li>
          <li>• Perhatikan waktu yang tersisa</li>
          <li>• Kerjakan soal yang mudah terlebih dahulu</li>
          <li>• Periksa kembali jawabanmu sebelum submit</li>
          <li>• Tetap tenang dan fokus</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentHome;