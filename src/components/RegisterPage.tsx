import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ArrowLeft, GraduationCap, MapPin } from 'lucide-react';
import { User } from '../App';
import { PaymentForm } from './PaymentForm';

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onNavigateLogin: () => void;
  onBack: () => void;
}

export function RegisterPage({ onRegister, onNavigateLogin, onBack }: RegisterPageProps) {
  const [selectedCampus, setSelectedCampus] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1: form utama, 2: form pembayaran
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    school: '',
    tkClass: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get selected campus from session storage
    const campusData = sessionStorage.getItem('selectedCampus');
    if (campusData) {
      const campus = JSON.parse(campusData);
      setSelectedCampus(campus);
      setFormData(prev => ({ ...prev, school: campus.schoolLevel }));
    }
  }, []);

  const createUserAndRegister = async () => {
    try {
      // Register user ke backend
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'Gagal membuat akun');
      }

      const userData = await userResponse.json();
      
      // Setelah akun dibuat, buat pendaftaran
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      const applicantResponse = await fetch('/api/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          campus_id: selectedCampus.campusId,
          school_id: selectedCampus.schoolLevel,
          tk_class: formData.tkClass,
        }),
      });

      if (!applicantResponse.ok) {
        const errorData = await applicantResponse.json();
        throw new Error(errorData.error || 'Gagal membuat pendaftaran');
      }

      const applicantData = await applicantResponse.json();
      
      // Return both user and applicant data
      return { ...userData.user, applicant_id: applicantData.applicant.id };
    } catch (error: any) {
      console.error('Error creating user and registration:', error);
      alert(error.message || 'Terjadi kesalahan saat membuat akun dan pendaftaran');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi jika jenjang adalah TK, maka kelas harus dipilih
    if (formData.school === 'tk' && !formData.tkClass) {
      alert('Silakan pilih kelas TK (A atau B)');
      return;
    }
    
    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok');
      return;
    }
    
    setLoading(true);
    try {
      const result = await createUserAndRegister();
      if (result) {
        setCurrentStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
  };

  const handlePaymentComplete = () => {
    // Simulasikan registrasi setelah pembayaran selesai
    onRegister({
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      role: 'applicant'
    });
  };

  if (currentStep === 2 && selectedCampus) {
    return (
      <PaymentForm 
        onBack={handleBackToForm} 
        onNext={handlePaymentComplete}
        onNavigateLogin={onNavigateLogin}
        selectedCampus={selectedCampus}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-emerald-800">Al Kahfi Batam</h1>
              <p className="text-sm text-gray-600">Pendaftaran Murid Baru</p>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 to-white">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Pendaftaran Calon Murid Baru</CardTitle>
              <CardDescription>
                Lengkapi formulir berikut untuk memulai proses pendaftaran
              </CardDescription>
              
              {/* Display selected campus info */}
              {selectedCampus && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <p className="text-emerald-900">Sekolah yang Dipilih</p>
                      <p className="text-emerald-700">{selectedCampus.campusName}</p>
                      <Badge variant="outline" className="mt-2 bg-white">
                        {selectedCampus.campusLocation}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap Calon Murid</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nama lengkap"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Orang Tua/Wali</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school">Jenjang Pendidikan</Label>
                    <Select 
                      value={formData.school} 
                      onValueChange={(value) => handleChange('school', value)}
                      disabled={!!selectedCampus}
                    >
                      <SelectTrigger id="school">
                        <SelectValue placeholder="Pilih jenjang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tk">TK (Taman Kanak-kanak)</SelectItem>
                        <SelectItem value="sd">SD (Sekolah Dasar)</SelectItem>
                        <SelectItem value="smp">SMP (Sekolah Menengah Pertama)</SelectItem>
                        <SelectItem value="sma">SMA (Sekolah Menengah Atas)</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedCampus && (
                      <p className="text-xs text-gray-500">
                        Jenjang telah dipilih dari halaman sebelumnya
                      </p>
                    )}
                  </div>
                </div>

                {/* Pilihan Kelas TK - hanya muncul jika jenjang adalah TK */}
                {formData.school === 'tk' && (
                  <div className="space-y-2">
                    <Label htmlFor="tkClass">Pilih Kelas</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.tkClass === 'tk-a' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleChange('tkClass', 'tk-a')}
                      >
                        TK A
                      </Button>
                      <Button
                        type="button"
                        variant={formData.tkClass === 'tk-b' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleChange('tkClass', 'tk-b')}
                      >
                        TK B
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Sudah punya akun? </span>
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="text-emerald-600 hover:underline"
                  >
                    Login di sini
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}