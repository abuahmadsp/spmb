import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  LogOut, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle,
  UserCheck,
  UserX,
  School
} from 'lucide-react';
import { User } from '../App';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { DataDownload } from './DataDownload';

interface SchoolAdminDashboardProps {
  user: User & { campusId?: string };
  onLogout: () => void;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  age: number;
  previousSchool: string;
}

export function SchoolAdminDashboard({ user, onLogout }: SchoolAdminDashboardProps) {
  // Mock data - all applicants
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([
    {
      id: '1',
      name: 'Ahmad Santoso',
      email: 'ahmad@email.com',
      phone: '081234567890',
      school: 'SD',
      status: 'pending',
      submittedAt: '2025-10-10',
      age: 7,
      previousSchool: 'TK Harapan'
    },
    {
      id: '2',
      name: 'Fatimah Zahra',
      email: 'fatimah@email.com',
      phone: '081234567891',
      school: 'TK',
      status: 'accepted',
      submittedAt: '2025-10-11',
      age: 5,
      previousSchool: 'Kelompok Bermain Ceria'
    },
    {
      id: '3',
      name: 'Muhammad Rizki',
      email: 'rizki@email.com',
      phone: '081234567892',
      school: 'SMP',
      status: 'pending',
      submittedAt: '2025-10-12',
      age: 13,
      previousSchool: 'SD Negeri 1'
    },
    {
      id: '4',
      name: 'Siti Nurhaliza',
      email: 'siti@email.com',
      phone: '081234567893',
      school: 'SMA',
      status: 'pending',
      submittedAt: '2025-10-13',
      age: 16,
      previousSchool: 'SMP Al Ikhlas'
    },
    {
      id: '5',
      name: 'Abdullah Rahman',
      email: 'abdullah@email.com',
      phone: '081234567894',
      school: 'SD',
      status: 'rejected',
      submittedAt: '2025-10-14',
      age: 8,
      previousSchool: 'TK Permata'
    },
    {
      id: '6',
      name: 'Aisyah Khairani',
      email: 'aisyah@email.com',
      phone: '081234567895',
      school: 'SMP',
      status: 'accepted',
      submittedAt: '2025-10-14',
      age: 14,
      previousSchool: 'SD Muhammadiyah'
    },
    {
      id: '7',
      name: 'Umar Farouq',
      email: 'umar@email.com',
      phone: '081234567896',
      school: 'TK',
      status: 'pending',
      submittedAt: '2025-10-15',
      age: 6,
      previousSchool: '-'
    },
    {
      id: '8',
      name: 'Khadijah Azzahra',
      email: 'khadijah@email.com',
      phone: '081234567897',
      school: 'SMA',
      status: 'pending',
      submittedAt: '2025-10-15',
      age: 15,
      previousSchool: 'SMP Negeri 3'
    },
    {
      id: '9',
      name: 'Yusuf Ibrahim',
      email: 'yusuf@email.com',
      phone: '081234567898',
      school: 'SD',
      status: 'accepted',
      submittedAt: '2025-10-16',
      age: 7,
      previousSchool: 'TK Al Fitrah'
    },
    {
      id: '10',
      name: 'Zahra Amelia',
      email: 'zahra@email.com',
      phone: '081234567899',
      school: 'SD',
      status: 'pending',
      submittedAt: '2025-10-16',
      age: 6,
      previousSchool: 'TK Islam'
    }
  ]);

  // Filter applicants by school
  const applicants = useMemo(() => {
    return allApplicants.filter(a => a.school === user.school);
  }, [allApplicants, user.school]);

  const handleVerify = (id: string, status: 'accepted' | 'rejected') => {
    setAllApplicants(prev =>
      prev.map(applicant =>
        applicant.id === id ? { ...applicant, status } : applicant
      )
    );
  };

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    rejected: applicants.filter(a => a.status === 'rejected').length
  };

  // Data for status distribution
  const statusData = [
    { name: 'Menunggu', value: stats.pending, color: '#f59e0b' },
    { name: 'Diterima', value: stats.accepted, color: '#10b981' },
    { name: 'Ditolak', value: stats.rejected, color: '#ef4444' }
  ];

  // Data for trend chart - applications over time
  const trendData = [
    { date: '10 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-10').length },
    { date: '11 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-11').length },
    { date: '12 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-12').length },
    { date: '13 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-13').length },
    { date: '14 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-14').length },
    { date: '15 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-15').length },
    { date: '16 Okt', count: applicants.filter(a => a.submittedAt === '2025-10-16').length }
  ];

  // School name display
  const schoolNames: Record<string, string> = {
    'TK': 'TK (Taman Kanak-kanak)',
    'SD': 'SD (Sekolah Dasar)',
    'SMP': 'SMP (Sekolah Menengah Pertama)',
    'SMA': 'SMA (Sekolah Menengah Atas)'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <School className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-emerald-800">Dashboard Admin {user.school}</h1>
                <p className="text-sm text-gray-600">Selamat datang, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* School Info Banner */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-1">{schoolNames[user.school || '']}</h2>
                <p className="text-emerald-100">
                  Kelola dan verifikasi pendaftar untuk {user.school}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="text-white" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Pendaftar</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-emerald-700">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Pendaftar {user.school}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Menunggu Verifikasi</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-amber-700">{stats.pending}</div>
              <p className="text-xs text-gray-600 mt-1">Perlu ditinjau</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Diterima</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-emerald-700">{stats.accepted}</div>
              <p className="text-xs text-gray-600 mt-1">Pendaftar diterima</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-red-700">{stats.rejected}</div>
              <p className="text-xs text-gray-600 mt-1">Pendaftar ditolak</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tren Pendaftaran</CardTitle>
              <CardDescription>Jumlah pendaftar per hari untuk {user.school}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Verifikasi</CardTitle>
              <CardDescription>Distribusi status pendaftar {user.school}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Download Data Section */}
        <div className="mb-8">
          <DataDownload userRole="school_admin" campusId={user.campusId} />
        </div>

        {/* Applicants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pendaftar {user.school}</CardTitle>
            <CardDescription>Kelola dan verifikasi calon murid {user.school}</CardDescription>
          </CardHeader>
          <CardContent>
            {applicants.length === 0 ? (
              <div className="text-center py-12">
                <School className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">Belum ada pendaftar untuk {user.school}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Usia</TableHead>
                      <TableHead>Sekolah Asal</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell>{applicant.name}</TableCell>
                        <TableCell>{applicant.email}</TableCell>
                        <TableCell>{applicant.phone}</TableCell>
                        <TableCell>{applicant.age} tahun</TableCell>
                        <TableCell>{applicant.previousSchool}</TableCell>
                        <TableCell>{applicant.submittedAt}</TableCell>
                        <TableCell>
                          {applicant.status === 'pending' && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                              Menunggu
                            </Badge>
                          )}
                          {applicant.status === 'accepted' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                              Diterima
                            </Badge>
                          )}
                          {applicant.status === 'rejected' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              Ditolak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {applicant.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerify(applicant.id, 'accepted')}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <UserCheck size={16} className="mr-1" />
                                  Terima
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleVerify(applicant.id, 'rejected')}
                                >
                                  <UserX size={16} className="mr-1" />
                                  Tolak
                                </Button>
                              </>
                            )}
                            {applicant.status === 'accepted' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerify(applicant.id, 'pending')}
                              >
                                Batalkan
                              </Button>
                            )}
                            {applicant.status === 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerify(applicant.id, 'pending')}
                              >
                                Tinjau Ulang
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
