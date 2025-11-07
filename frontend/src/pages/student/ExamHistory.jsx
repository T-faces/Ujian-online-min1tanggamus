import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Clock, Award, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExamHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/exams/history`);
      setHistory(response.data);
    } catch (error) {
      toast.error('Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-700';
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'graded': return 'Selesai';
      case 'submitted': return 'Diperiksa';
      case 'in_progress': return 'Sedang Dikerjakan';
      default: return status;
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold text-gray-800 mb-8" data-testid="history-title">Riwayat Ujian 📊</h1>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Clock size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada riwayat ujian</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 card-hover" data-testid={`history-item-${idx}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.exam_title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Award size={16} />
                      <span>{item.subject_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{new Date(item.started_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                  {item.status === 'graded' && item.score !== null && (
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-800">{item.score}/{item.total_points}</p>
                      <p className="text-sm text-gray-600">
                        {((item.score / item.total_points) * 100).toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamHistory;