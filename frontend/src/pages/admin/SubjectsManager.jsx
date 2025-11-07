import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SubjectsManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      toast.error('Gagal memuat mata pelajaran');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/subjects`, formData);
      toast.success('Mata pelajaran berhasil ditambahkan!');
      setIsDialogOpen(false);
      setFormData({ name: '', description: '', icon: '' });
      fetchSubjects();
    } catch (error) {
      toast.error('Gagal menambahkan mata pelajaran');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus mata pelajaran ini?')) return;
    
    try {
      await axios.delete(`${API}/subjects/${id}`);
      toast.success('Mata pelajaran berhasil dihapus');
      fetchSubjects();
    } catch (error) {
      toast.error('Gagal menghapus mata pelajaran');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800" data-testid="subjects-title">Mata Pelajaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white" data-testid="add-subject-btn">
              <Plus size={20} className="mr-2" />
              Tambah Mata Pelajaran
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="subject-dialog">
            <DialogHeader>
              <DialogTitle>Tambah Mata Pelajaran Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Mata Pelajaran</Label>
                <Input
                  id="name"
                  data-testid="subject-name-input"
                  placeholder="Contoh: Matematika"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Input
                  id="description"
                  data-testid="subject-description-input"
                  placeholder="Deskripsi singkat"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" data-testid="subject-submit-btn">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada mata pelajaran. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-2xl shadow-lg p-6 card-hover" data-testid={`subject-card-${subject.id}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(subject.id)}
                  data-testid={`delete-subject-${subject.id}`}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
              {subject.description && (
                <p className="text-gray-600 text-sm">{subject.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectsManager;