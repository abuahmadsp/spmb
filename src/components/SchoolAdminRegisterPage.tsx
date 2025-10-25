import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, GraduationCap, School } from 'lucide-react';
import { User, SchoolLevel } from '../App';

interface SchoolAdminRegisterPageProps {
  onRegister: (user: User) => void;
  onNavigateLogin: () => void;
  onBack: () => void;
}

export function SchoolAdminRegisterPage({ onRegister, onNavigateLogin, onBack }: SchoolAdminRegisterPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    school: '' as SchoolLevel,
    adminCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration
    onRegister({
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      role: 'school-admin',
      school: formData.school
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              <p className="text-sm text-gray-600">Registrasi Admin Sekolah</p>
            </div>
          </div>
        </div>
      </header>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 to-white">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="text-emerald-700" size={32} />
              </div>
              <CardTitle>Registrasi Administrator Sekolah</CardTitle>
              <CardDescription>
                Daftar sebagai administrator untuk mengelola pendaftaran murid di sekolah Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
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
                    <Label htmlFor="email">Email</Label>
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
                    <Label htmlFor="school">Sekolah yang Dikelola</Label>
                    <Select value={formData.school} onValueChange={(value: SchoolLevel) => handleChange('school', value)}>
                      <SelectTrigger id="school">
                        <SelectValue placeholder="Pilih sekolah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TK">TK (Taman Kanak-kanak)</SelectItem>
                        <SelectItem value="SD">SD (Sekolah Dasar)</SelectItem>
                        <SelectItem value="SMP">SMP (Sekolah Menengah Pertama)</SelectItem>
                        <SelectItem value="SMA">SMA (Sekolah Menengah Atas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminCode">Kode Administrator</Label>
                  <Input
                    id="adminCode"
                    type="text"
                    placeholder="Masukkan kode yang diberikan oleh yayasan"
                    value={formData.adminCode}
                    onChange={(e) => handleChange('adminCode', e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Kode administrator diberikan oleh pihak yayasan untuk verifikasi
                  </p>
                </div>

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
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Daftar sebagai Admin Sekolah
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
