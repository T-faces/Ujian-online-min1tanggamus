import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, TrendingUp, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResultsViewer = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API}/exams/history`);
      setResults(response.data);
    } catch (error) {
      toast.error('Gagal memuat hasil ujian');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>;
  }

  const completedResults = results.filter(r => r.status === 'graded');
  const avgScore = completedResults.length > 0
    ? completedResults.reduce((sum, r) => sum + (r.score / r.total_points * 100), 0) / completedResults.length
    : 0;

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold text-gray-800 mb-8" data-testid="results-title">Hasil Ujian</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="stat-total-submissions">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Users className="text-white" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{results.length}</h3>
          <p className="text-gray-600">Total Pengumpulan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="stat-completed">
          <div className="bg-gradient-to-br from-green-400 to-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Award className="text-white" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{completedResults.length}</h3>
          <p className="text-gray-600">Ujian Selesai</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6" data-testid="stat-average">
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="text-white" size={28} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{avgScore.toFixed(1)}</h3>
          <p className="text-gray-600">Rata-rata Nilai</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Users size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada siswa yang mengerjakan ujian</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="results-table">
              <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Nama Siswa</th>
                  <th className="px-6 py-4 text-left">Ujian</th>
                  <th className="px-6 py-4 text-left">Mata Pelajaran</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-left">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50" data-testid={`result-row-${idx}`}>
                    <td className="px-6 py-4 font-medium">{result.student_name}</td>
                    <td className="px-6 py-4">{result.exam_title}</td>
                    <td className="px-6 py-4">{result.subject_name}</td>
                    <td className="px-6 py-4 text-center">
                      {result.status === 'graded' ? (
                        <span className="font-bold text-lg">
                          {result.score}/{result.total_points}
                          <span className="text-sm text-gray-500 ml-1">
                            ({((result.score / result.total_points) * 100).toFixed(0)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {result.status === 'graded' && (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Selesai
                        </span>
                      )}
                      {result.status === 'submitted' && (
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          Diperiksa
                        </span>
                      )}
                      {result.status === 'in_progress' && (
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                          Sedang Dikerjakan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(result.started_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsViewer;