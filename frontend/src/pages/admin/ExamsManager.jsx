import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, FileText, Edit, CheckCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ExamsManager = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const [examFormData, setExamFormData] = useState({
    title: '',
    subject_id: '',
    description: '',
    duration_minutes: 60,
    class_name: ''
  });

  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '0',
    points: 10,
    order: 0
  });

  useEffect(() => {
    fetchExams();
    fetchSubjects();
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

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      toast.error('Gagal memuat mata pelajaran');
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    if (!examFormData.subject_id) {
      toast.error('Pilih mata pelajaran');
      return;
    }
    
    try {
      await axios.post(`${API}/exams`, examFormData);
      toast.success('Ujian berhasil dibuat!');
      setIsExamDialogOpen(false);
      setExamFormData({ title: '', subject_id: '', description: '', duration_minutes: 60, class_name: '' });
      fetchExams();
    } catch (error) {
      toast.error('Gagal membuat ujian');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Yakin ingin menghapus ujian ini?')) return;
    
    try {
      await axios.delete(`${API}/exams/${id}`);
      toast.success('Ujian berhasil dihapus');
      fetchExams();
    } catch (error) {
      toast.error('Gagal menghapus ujian');
    }
  };

  const openQuestionDialog = async (exam) => {
    setSelectedExam(exam);
    try {
      const response = await axios.get(`${API}/exams/${exam.id}/questions`);
      setQuestions(response.data);
      setQuestionFormData({
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '0',
        points: 10,
        order: response.data.length
      });
      setIsQuestionDialogOpen(true);
    } catch (error) {
      toast.error('Gagal memuat soal');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/exams/${selectedExam.id}/questions`, questionFormData);
      toast.success('Soal berhasil ditambahkan!');
      
      // Refresh questions
      const response = await axios.get(`${API}/exams/${selectedExam.id}/questions`);
      setQuestions(response.data);
      
      // Reset form
      setQuestionFormData({
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '0',
        points: 10,
        order: response.data.length
      });
    } catch (error) {
      toast.error('Gagal menambahkan soal');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Yakin ingin menghapus soal ini?')) return;
    
    try {
      await axios.delete(`${API}/questions/${questionId}`);
      toast.success('Soal berhasil dihapus');
      const response = await axios.get(`${API}/exams/${selectedExam.id}/questions`);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Gagal menghapus soal');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800" data-testid="exams-title">Kelola Ujian</h1>
        <Button 
          onClick={() => setIsExamDialogOpen(true)} 
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
          data-testid="add-exam-btn"
        >
          <Plus size={20} className="mr-2" />
          Buat Ujian Baru
        </Button>
      </div>

      {/* Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="max-w-md" data-testid="exam-dialog">
          <DialogHeader>
            <DialogTitle>Buat Ujian Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExamSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Ujian</Label>
              <Input
                id="title"
                data-testid="exam-title-input"
                placeholder="Contoh: Ujian Matematika Kelas 4"
                value={examFormData.title}
                onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Mata Pelajaran</Label>
              <Select value={examFormData.subject_id} onValueChange={(value) => setExamFormData({ ...examFormData, subject_id: value })}>
                <SelectTrigger data-testid="exam-subject-select">
                  <SelectValue placeholder="Pilih mata pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                data-testid="exam-description-input"
                placeholder="Deskripsi ujian"
                value={examFormData.description}
                onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="duration">Durasi (menit)</Label>
              <Input
                id="duration"
                type="number"
                data-testid="exam-duration-input"
                value={examFormData.duration_minutes}
                onChange={(e) => setExamFormData({ ...examFormData, duration_minutes: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="class_name">Kelas (Opsional)</Label>
              <Input
                id="class_name"
                data-testid="exam-class-input"
                placeholder="Contoh: 4A"
                value={examFormData.class_name}
                onChange={(e) => setExamFormData({ ...examFormData, class_name: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" data-testid="exam-submit-btn">
              Simpan Ujian
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="question-dialog">
          <DialogHeader>
            <DialogTitle>Kelola Soal: {selectedExam?.title}</DialogTitle>
          </DialogHeader>
          
          {/* Existing Questions */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Soal yang Ada ({questions.length})</h3>
            {questions.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada soal. Tambahkan soal pertama di bawah!</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start" data-testid={`question-item-${idx}`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{idx + 1}. {q.question_text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {q.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'} - {q.points} poin
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(q.id)}
                      data-testid={`delete-question-${idx}`}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Question Form */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-3">Tambah Soal Baru</h3>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div>
                <Label>Jenis Soal</Label>
                <RadioGroup 
                  value={questionFormData.question_type}
                  onValueChange={(value) => setQuestionFormData({ ...questionFormData, question_type: value })}
                  className="flex gap-4"
                  data-testid="question-type-group"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple_choice" id="mc" data-testid="type-multiple-choice" />
                    <Label htmlFor="mc" className="cursor-pointer">Pilihan Ganda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="essay" id="essay" data-testid="type-essay" />
                    <Label htmlFor="essay" className="cursor-pointer">Essay</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="question_text">Pertanyaan</Label>
                <Textarea
                  id="question_text"
                  data-testid="question-text-input"
                  placeholder="Tulis pertanyaan..."
                  value={questionFormData.question_text}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                  required
                />
              </div>

              {questionFormData.question_type === 'multiple_choice' && (
                <>
                  <div>
                    <Label>Pilihan Jawaban</Label>
                    {questionFormData.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium w-8">{String.fromCharCode(65 + idx)}.</span>
                        <Input
                          data-testid={`option-input-${idx}`}
                          placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options];
                            newOptions[idx] = e.target.value;
                            setQuestionFormData({ ...questionFormData, options: newOptions });
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label>Jawaban Benar</Label>
                    <Select 
                      value={questionFormData.correct_answer} 
                      onValueChange={(value) => setQuestionFormData({ ...questionFormData, correct_answer: value })}
                    >
                      <SelectTrigger data-testid="correct-answer-select">
                        <SelectValue placeholder="Pilih jawaban benar" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionFormData.options.map((_, idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            Pilihan {String.fromCharCode(65 + idx)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="points">Poin</Label>
                <Input
                  id="points"
                  type="number"
                  data-testid="question-points-input"
                  value={questionFormData.points}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, points: parseInt(e.target.value) })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" data-testid="question-submit-btn">
                <Plus size={16} className="mr-2" />
                Tambah Soal
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada ujian. Buat ujian pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-2xl shadow-lg p-6 card-hover" data-testid={`exam-card-${exam.id}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-br from-orange-400 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteExam(exam.id)}
                  data-testid={`delete-exam-${exam.id}`}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
              <p className="text-sm text-gray-600 mb-1">📚 {exam.subject_name}</p>
              <p className="text-sm text-gray-600 mb-1">⏱️ {exam.duration_minutes} menit</p>
              {exam.class_name && <p className="text-sm text-gray-600 mb-3">🏛️ Kelas {exam.class_name}</p>}
              <Button
                onClick={() => openQuestionDialog(exam)}
                className="w-full mt-4"
                variant="outline"
                data-testid={`manage-questions-${exam.id}`}
              >
                <Edit size={16} className="mr-2" />
                Kelola Soal
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsManager;