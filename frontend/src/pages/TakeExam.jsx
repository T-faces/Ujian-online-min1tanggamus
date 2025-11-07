import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Send, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TakeExam = ({ user }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExamData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        axios.get(`${API}/exams/${examId}`),
        axios.get(`${API}/exams/${examId}/questions`)
      ]);
      
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      setTimeLeft(examRes.data.duration_minutes * 60);
    } catch (error) {
      toast.error('Gagal memuat ujian');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const confirmed = window.confirm('Yakin ingin mengumpulkan ujian? Jawaban tidak bisa diubah setelah dikumpulkan.');
      if (!confirmed) return;
    }

    setSubmitting(true);

    try {
      const submission = {
        answers: questions.map(q => ({
          question_id: q.id,
          answer_text: answers[q.id] || ''
        }))
      };

      const response = await axios.post(`${API}/exams/${examId}/submit`, submission);
      toast.success('Ujian berhasil dikumpulkan!');
      navigate(`/exam/${examId}/result`, { state: { result: response.data } });
    } catch (error) {
      toast.error('Gagal mengumpulkan ujian');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k]).length;
  const progress = (answeredCount / questions.length) * 100;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 sticky top-4 z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800" data-testid="exam-title">{exam.title}</h1>
              <p className="text-gray-600 text-sm">{exam.subject_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock size={20} />
                <span className="font-bold text-lg" data-testid="timer">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progres: {answeredCount} / {questions.length} soal</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-bar" />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6" data-testid="questions-container">
          {questions.map((question, idx) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6 animate-fadeIn" data-testid={`question-${idx}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-800 font-medium">{question.question_text}</p>
                  <p className="text-sm text-gray-500 mt-1">{question.points} poin</p>
                </div>
              </div>

              {question.question_type === 'multiple_choice' ? (
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                  data-testid={`answer-group-${idx}`}
                >
                  {question.options && question.options.map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={String(optIdx)} id={`q${question.id}-opt${optIdx}`} data-testid={`option-${idx}-${optIdx}`} />
                      <Label htmlFor={`q${question.id}-opt${optIdx}`} className="cursor-pointer flex-1">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  data-testid={`essay-answer-${idx}`}
                  placeholder="Tulis jawabanmu di sini..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="min-h-[120px]"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          {answeredCount < questions.length && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
              <p className="text-sm text-yellow-800">
                Kamu belum menjawab semua soal. Masih ada <strong>{questions.length - answeredCount} soal</strong> yang belum dijawab.
              </p>
            </div>
          )}
          
          <Button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            data-testid="submit-exam-btn"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-6 text-lg font-semibold"
          >
            {submitting ? 'Mengumpulkan...' : (
              <>
                <Send size={20} className="mr-2" />
                Kumpulkan Ujian
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;