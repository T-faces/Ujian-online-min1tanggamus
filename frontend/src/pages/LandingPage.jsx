import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fadeIn">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-6 animate-bounce-slow" data-testid="landing-title">
              Ujian Online SD/MI
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto" data-testid="landing-subtitle">
              Platform ujian online yang menyenangkan untuk siswa SD/MI.
              Belajar jadi lebih seru dengan fitur interaktif! 🎉
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-6 text-lg rounded-full shadow-lg" data-testid="login-btn">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-full" data-testid="register-btn">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800" data-testid="features-title">
          Fitur Unggulan ✨
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover" data-testid="feature-card-questions">
            <div className="bg-gradient-to-br from-pink-400 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Soal Beragam</h3>
            <p className="text-gray-600">Pilihan ganda dan essay untuk latihan lengkap</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover" data-testid="feature-card-timer">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Timer Otomatis</h3>
            <p className="text-gray-600">Batas waktu yang membantu latihan manajemen waktu</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover" data-testid="feature-card-results">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Award className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Hasil Langsung</h3>
            <p className="text-gray-600">Lihat nilai segera setelah menyelesaikan ujian</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg card-hover" data-testid="feature-card-history">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Riwayat Ujian</h3>
            <p className="text-gray-600">Pantau perkembangan belajarmu dari waktu ke waktu</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="cta-title">
            Siap Memulai Petualangan Belajar? 🚀
          </h2>
          <p className="text-white text-lg mb-8">Bergabunglah dengan ribuan siswa yang sudah belajar dengan cara yang menyenangkan!</p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg font-semibold" data-testid="cta-register-btn">
              Daftar Gratis Sekarang!
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Ujian Online SD/MI. Dibuat dengan ❤️ untuk pendidikan Indonesia</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;