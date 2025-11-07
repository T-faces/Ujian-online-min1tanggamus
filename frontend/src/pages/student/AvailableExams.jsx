import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileText, Clock, BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AvailableExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${API}/exams`);
      setExams(response.data);
    } catch (error) {
      toast.error('Gagal memuat ujian');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      await axios.post(`${API}/exams/${examId}/start`);
      toast.success('Ujian dimulai!');
      navigate(`/exam/${examId}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal memulai ujian');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold text-gray-800 mb-8" data-testid="available-exams-title">Ujian Tersedia 📝</h1>

      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada ujian yang tersedia saat ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl shadow-lg p-6 card-hover" data-testid={`exam-card-${exam.id}`}>
              <div className="bg-gradient-to-br from-pink-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{exam.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen size={16} />
                  <span className="text-sm">{exam.subject_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm">{exam.duration_minutes} menit</span>
                </div>
                {exam.class_name && (
                  <div className="text-sm text-gray-600">
                    🏛️ Kelas {exam.class_name}
                  </div>
                )}
              </div>

              {exam.description && (
                <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
              )}

              <Button
                onClick={() => handleStartExam(exam.id)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                data-testid={`start-exam-${exam.id}`}
              >
                Mulai Ujian
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;