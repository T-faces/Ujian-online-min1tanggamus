import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RegisterPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      onLogin(response.data.user, response.data.token);
      toast.success('Berhasil mendaftar!');
      navigate(response.data.user.role === 'admin' ? '/admin' : '/student');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal mendaftar. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2" data-testid="register-title">Daftar Akun Baru</h1>
            <p className="text-gray-600">Mulai petualangan belajarmu!</p>
          </div>

          <form onSubmit={handleSubmit} data-testid="register-form">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  data-testid="register-name-input"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="register-email-input"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="register-password-input"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-gray-700 mb-2 block">Daftar sebagai</Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  data-testid="register-role-group"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" data-testid="role-student" />
                    <Label htmlFor="student" className="cursor-pointer">Siswa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" data-testid="role-admin" />
                    <Label htmlFor="admin" className="cursor-pointer">Admin/Guru</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.role === 'student' && (
                <div>
                  <Label htmlFor="class_name" className="text-gray-700">Kelas</Label>
                  <Input
                    id="class_name"
                    type="text"
                    data-testid="register-class-input"
                    placeholder="Contoh: 4A, 5B"
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}

              <Button
                type="submit"
                data-testid="register-submit-btn"
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-6 rounded-full text-lg font-semibold"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold" data-testid="login-link">
                Masuk di sini
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm" data-testid="back-home-link">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;