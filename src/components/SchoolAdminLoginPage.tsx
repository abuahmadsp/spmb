import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, GraduationCap, School } from 'lucide-react';
import { User, SchoolLevel } from '../App';

interface SchoolAdminLoginPageProps {
  onLogin: (user: User) => void;
  onNavigateRegister: () => void;
  onBack: () => void;
}

export function SchoolAdminLoginPage({ onLogin, onNavigateRegister, onBack }: SchoolAdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState<SchoolLevel>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login for school admin
    onLogin({
      id: 'school-admin-1',
      email: email,
      name: `Admin ${school}`,
      role: 'school-admin',
      school: school
    });
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
              <p className="text-sm text-gray-600">Login Admin Sekolah</p>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 to-white">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="text-emerald-700" size={32} />
              </div>
              <CardTitle>Login Administrator Sekolah</CardTitle>
              <CardDescription>
                Masuk ke dashboard untuk mengelola pendaftaran murid di sekolah Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school">Sekolah yang Dikelola</Label>
                  <Select value={school} onValueChange={(value: SchoolLevel) => setSchool(value)} required>
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email Administrator</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin.tk@alkahfi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Login sebagai Admin Sekolah
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Belum terdaftar sebagai admin? </span>
                  <button
                    type="button"
                    onClick={onNavigateRegister}
                    className="text-emerald-600 hover:underline"
                  >
                    Daftar di sini
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
