import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { User } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateRegister: () => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onNavigateRegister, onBack }: LoginPageProps) {
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPassword, setApplicantPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleApplicantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login for applicant
    onLogin({
      id: '1',
      email: applicantEmail,
      name: 'Ahmad Santoso',
      role: 'applicant'
    });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login for admin
    onLogin({
      id: 'admin1',
      email: adminEmail,
      name: 'Administrator',
      role: 'admin'
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
              <p className="text-sm text-gray-600">SPMB Login</p>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 to-white">
        <div className="w-full max-w-md">
          <Tabs defaultValue="applicant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applicant">Login Pendaftar</TabsTrigger>
              <TabsTrigger value="admin">Login Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applicant">
              <Card>
                <CardHeader>
                  <CardTitle>Login Pendaftar</CardTitle>
                  <CardDescription>
                    Masuk ke akun pendaftar untuk melanjutkan proses pendaftaran
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleApplicantLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicant-email">Email</Label>
                      <Input
                        id="applicant-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="applicant-password">Password</Label>
                      <Input
                        id="applicant-password"
                        type="password"
                        placeholder="••••••••"
                        value={applicantPassword}
                        onChange={(e) => setApplicantPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Login
                    </Button>

                    <div className="text-center text-sm">
                      <span className="text-gray-600">Belum punya akun? </span>
                      <button
                        type="button"
                        onClick={onNavigateRegister}
                        className="text-emerald-600 hover:underline"
                      >
                        Daftar sekarang
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Login Admin</CardTitle>
                  <CardDescription>
                    Masuk ke dashboard admin untuk mengelola pendaftaran
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Admin</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@alkahfi.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Login sebagai Admin
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
