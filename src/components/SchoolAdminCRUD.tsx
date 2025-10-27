import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { User, SchoolLevel } from '../App';
import { GraduationCap, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface SchoolAdminCRUDProps {
  school?: SchoolLevel; // Informasi sekolah yang dikelola oleh admin sekolah ini
}

interface SchoolUser extends User {
  role: 'admin' | 'applicant' | 'school-admin';
  schoolLevel?: SchoolLevel;
}

// Tambahkan interface untuk form validation
interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

export function SchoolAdminCRUD({ school }: SchoolAdminCRUDProps) {
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SchoolUser[]>([]);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SchoolUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'applicant' as 'admin' | 'applicant' | 'school-admin',
    school: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Simulasi data pengguna
  useEffect(() => {
    // Dalam implementasi sebenarnya, ini akan diambil dari API
    const mockUsers: SchoolUser[] = [
      {
        id: '1',
        name: 'Ahmad Santoso',
        email: 'ahmad@example.com',
        role: 'applicant',
        schoolLevel: 'SD'
      },
      {
        id: '2',
        name: 'Siti Aminah',
        email: 'siti@example.com',
        role: 'applicant',
        schoolLevel: 'SD'
      },
      {
        id: '3',
        name: 'Budi Prasetyo',
        email: 'budi@example.com',
        role: 'admin',
        schoolLevel: 'SD'
      },
      {
        id: '4',
        name: 'Rina Kusuma',
        email: 'rina@example.com',
        role: 'applicant',
        schoolLevel: 'TK'
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, [school]);

  // Filter pengguna berdasarkan pencarian dan filter
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterRole, users]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      role: 'applicant',
      school: school || ''
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: SchoolUser) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.schoolLevel || school || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (user: SchoolUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      setUsers(prev => 
        prev.map(user => 
          user.id === formData.id 
            ? { ...user, name: formData.name, email: formData.email, role: formData.role } 
            : user
        )
      );
    } else {
      // Add new user
      const newUser: SchoolUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        schoolLevel: formData.school as SchoolLevel
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Hapus error saat user mulai mengetik
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nama harus diisi';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    // Tidak perlu validasi role karena selalu dipilih dari dropdown
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (editingUser) {
      // Update existing user
      setUsers(prev => 
        prev.map(user => 
          user.id === formData.id 
            ? { ...user, name: formData.name, email: formData.email, role: formData.role } 
            : user
        )
      );
    } else {
      // Add new user
      const newUser: SchoolUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        schoolLevel: formData.school as SchoolLevel
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    setIsDialogOpen(false);
    setFormErrors({}); // Reset errors after successful submission
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-800">Manajemen Pengguna</h2>
          <p className="text-gray-600">Kelola pengguna yang terdaftar di {school || 'Sekolah'}</p>
        </div>
        
        <Button onClick={handleAddUser} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus size={16} className="mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-40">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Filter peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Peran</SelectItem>
                  <SelectItem value="applicant">Calon Murid</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="school-admin">Admin Sekolah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            {filteredUsers.length} pengguna ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead className="w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Tidak ada pengguna ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'applicant' ? 'default' : 
                                  user.role === 'admin' ? 'secondary' : 
                                  'outline'}
                          className={
                            user.role === 'applicant' ? 'bg-emerald-100 text-emerald-800' :
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }
                        >
                          {user.role === 'applicant' ? 'Calon Murid' : 
                           user.role === 'admin' ? 'Admin' : 
                           'Admin Sekolah'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.schoolLevel || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Edit informasi pengguna di bawah ini' 
                : 'Tambahkan pengguna baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={formErrors.name ? 'border-red-500' : ''}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={formErrors.email ? 'border-red-500' : ''}
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'applicant' | 'school-admin') => handleInputChange('role', value)}
              >
                <SelectTrigger id="role" className={formErrors.role ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applicant">Calon Murid</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="school-admin">Admin Sekolah</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.role && (
                <p className="text-red-500 text-sm">{formErrors.role}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school">Sekolah</Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                disabled // Dalam konteks admin sekolah, hanya dapat mengelola sekolah mereka sendiri
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {editingUser ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus pengguna ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Pengguna dengan nama "{userToDelete?.name}" 
              akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}