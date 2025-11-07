import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, TrendingUp, CheckCircle, Home } from 'lucide-react';

const ExamResult = ({ user }) => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    } else {
      navigate('/student/history');
    }
  }, [location, navigate]);

  if (!result) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  const percentage = (result.score / result.total_points) * 100;
  const grade = percentage >= 80 ? 'Sangat Baik' : percentage >= 70 ? 'Baik' : percentage >= 60 ? 'Cukup' : 'Perlu Belajar Lebih Giat';
  const gradeColor = percentage >= 80 ? 'from-green-400 to-green-600' : percentage >= 70 ? 'from-blue-400 to-blue-600' : percentage >= 60 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
          {/* Trophy Icon */}
          <div className={`bg-gradient-to-br ${gradeColor} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Award className="text-white" size={48} />
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-2" data-testid="result-title">Ujian Selesai!</h1>
          <p className="text-gray-600 text-lg mb-8">Selamat {user.name}, kamu telah menyelesaikan ujian</p>

          {/* Score Display */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
            <p className="text-gray-600 mb-2">Nilai Kamu</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl font-bold text-gray-800" data-testid="result-score">{result.score}</span>
              <span className="text-3xl text-gray-400">/</span>
              <span className="text-4xl text-gray-600" data-testid="result-total">{result.total_points}</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="text-purple-600" size={24} />
              <span className="text-2xl font-bold text-purple-600" data-testid="result-percentage">{percentage.toFixed(0)}%</span>
            </div>
            <p className={`text-lg font-semibold bg-gradient-to-r ${gradeColor} bg-clip-text text-transparent`} data-testid="result-grade">
              {grade}
            </p>
          </div>

          {/* Encouragement Message */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 flex-shrink-0" size={24} />
              <div className="text-left">
                <p className="text-blue-900 font-medium mb-2">
                  {percentage >= 80 ? '🎉 Luar biasa! Pertahankan!' : 
                   percentage >= 70 ? '👍 Bagus! Terus tingkatkan!' :
                   percentage >= 60 ? '💪 Cukup baik, terus belajar!' :
                   '📚 Jangan menyerah, terus semangat!'}
                </p>
                <p className="text-blue-700 text-sm">
                  Kamu bisa melihat riwayat ujian dan terus berlatih untuk meningkatkan nilaimu!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/student')}
              data-testid="back-home-btn"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg font-semibold"
            >
              <Home size={20} className="mr-2" />
              Kembali ke Beranda
            </Button>
            <Button
              onClick={() => navigate('/student/history')}
              data-testid="view-history-btn"
              variant="outline"
              className="flex-1 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 py-6 text-lg font-semibold"
            >
              Lihat Riwayat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;