import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  GraduationCap, 
  LogOut, 
  Upload, 
  FileText, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../App';

interface ApplicantDashboardProps {
  user: User;
  onLogout: () => void;
}

export function ApplicantDashboard({ user, onLogout }: ApplicantDashboardProps) {
  const [applicationStatus] = useState<'draft' | 'submitted' | 'verified'>('submitted');
  const [completionPercentage] = useState(75);

  const [formData, setFormData] = useState({
    studentName: 'Ahmad Santoso',
    birthPlace: 'Batam',
    birthDate: '2015-05-10',
    gender: 'male',
    address: 'Jl. Merdeka No. 123, Batam',
    parentName: 'Budi Santoso',
    parentPhone: '081234567890',
    school: 'SD',
    previousSchool: 'TK Harapan Bangsa',
    notes: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [uploadedFiles, setUploadedFiles] = useState({
    akte: null as File | null,
    kk: null as File | null,
    ijazah: null as File | null,
    foto: null as File | null
  });

  const handleFileUpload = (docType: 'akte' | 'kk' | 'ijazah' | 'foto', file: File | undefined) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar. Maksimal 5MB.`);
        return;
      }

      // Update the uploaded file state
      setUploadedFiles(prev => ({
        ...prev,
        [docType]: file
      }));
    }
  };

  const handleSaveDraft = () => {
    // Save form data and uploaded files as draft
    const draftData = {
      formData,
      uploadedFiles: {
        akte: uploadedFiles.akte ? { name: uploadedFiles.akte.name, size: uploadedFiles.akte.size } : null,
        kk: uploadedFiles.kk ? { name: uploadedFiles.kk.name, size: uploadedFiles.kk.size } : null,
        ijazah: uploadedFiles.ijazah ? { name: uploadedFiles.ijazah.name, size: uploadedFiles.ijazah.size } : null,
        foto: uploadedFiles.foto ? { name: uploadedFiles.foto.name, size: uploadedFiles.foto.size } : null
      },
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`draft_application_${user.id}`, JSON.stringify(draftData));
    alert('Draft berhasil disimpan!');
  };

  const handleSubmit = () => {
    // Check if required documents are uploaded
    if (!uploadedFiles.akte) {
      alert('Mohon upload Akta Kelahiran terlebih dahulu.');
      return;
    }
    if (!uploadedFiles.kk) {
      alert('Mohon upload Kartu Keluarga terlebih dahulu.');
      return;
    }
    if (!uploadedFiles.ijazah) {
      alert('Mohon upload Ijazah Terakhir terlebih dahulu.');
      return;
    }
    if (!uploadedFiles.foto) {
      alert('Mohon upload Pas Foto 3x4 terlebih dahulu.');
      return;
    }

    // In a real application, this would send data to a server
    // For now, we'll just show a success message
    alert('Pendaftaran berhasil dikirim! Dokumen sudah diupload.');
    
    // In a real app, you would send the files to a backend server here
    // For now, simulate the submission process
    console.log('Form Data:', formData);
    console.log('Uploaded Files:', uploadedFiles);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-emerald-800">Portal Pendaftar</h1>
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicationStatus === 'draft' && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                    <FileText size={14} className="mr-1" />
                    Draft
                  </Badge>
                )}
                {applicationStatus === 'submitted' && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <AlertCircle size={14} className="mr-1" />
                    Menunggu Verifikasi
                  </Badge>
                )}
                {applicationStatus === 'verified' && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                    <CheckCircle2 size={14} className="mr-1" />
                    Diterima
                  </Badge>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Kelengkapan Data</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>

                {applicationStatus === 'submitted' && (
                  <p className="text-sm text-gray-600">
                    Pendaftaran Anda sedang dalam proses verifikasi oleh tim admin. Kami akan memberitahu Anda melalui email.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Important Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Penting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">
                    Pastikan semua data yang diisi sudah benar dan lengkap.
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    Dokumen yang perlu disiapkan:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Akta Kelahiran</li>
                    <li>Kartu Keluarga</li>
                    <li>Ijazah Terakhir</li>
                    <li>Pas Foto 3x4</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Formulir Pendaftaran</CardTitle>
                <CardDescription>
                  Lengkapi data calon murid dengan benar dan lengkap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* Student Information */}
                  <div className="space-y-4">
                    <h3 className="text-emerald-800">Data Calon Murid</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Nama Lengkap</Label>
                        <Input
                          id="studentName"
                          value={formData.studentName}
                          onChange={(e) => handleChange('studentName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Jenis Kelamin</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                          <SelectTrigger id="gender">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Laki-laki</SelectItem>
                            <SelectItem value="female">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthPlace">Tempat Lahir</Label>
                        <Input
                          id="birthPlace"
                          value={formData.birthPlace}
                          onChange={(e) => handleChange('birthPlace', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Tanggal Lahir</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleChange('birthDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat Lengkap</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="space-y-4">
                    <h3 className="text-emerald-800">Data Orang Tua/Wali</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Nama Orang Tua/Wali</Label>
                        <Input
                          id="parentName"
                          value={formData.parentName}
                          onChange={(e) => handleChange('parentName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">Nomor Telepon</Label>
                        <Input
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={(e) => handleChange('parentPhone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* School Information */}
                  <div className="space-y-4">
                    <h3 className="text-emerald-800">Data Pendidikan</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="school">Jenjang yang Dituju</Label>
                        <Select value={formData.school} onValueChange={(value) => handleChange('school', value)}>
                          <SelectTrigger id="school">
                            <SelectValue />
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
                        <Label htmlFor="previousSchool">Sekolah Asal</Label>
                        <Input
                          id="previousSchool"
                          value={formData.previousSchool}
                          onChange={(e) => handleChange('previousSchool', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-4">
                    <h3 className="text-emerald-800">Upload Dokumen</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Akta Kelahiran</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50">
                          <input 
                            type="file" 
                            className="hidden" 
                            id="akte-kelahiran" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload('akte', e.target.files?.[0])}
                          />
                          <label htmlFor="akte-kelahiran" className="cursor-pointer flex flex-col items-center">
                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-600">Klik untuk upload</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                          </label>
                          {uploadedFiles.akte && (
                            <div className="mt-2 text-xs text-emerald-600 flex items-center">
                              <CheckCircle2 size={14} className="mr-1" />
                              {uploadedFiles.akte.name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Kartu Keluarga</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50">
                          <input 
                            type="file" 
                            className="hidden" 
                            id="kartu-keluarga" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload('kk', e.target.files?.[0])}
                          />
                          <label htmlFor="kartu-keluarga" className="cursor-pointer flex flex-col items-center">
                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-600">Klik untuk upload</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                          </label>
                          {uploadedFiles.kk && (
                            <div className="mt-2 text-xs text-emerald-600 flex items-center">
                              <CheckCircle2 size={14} className="mr-1" />
                              {uploadedFiles.kk.name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Ijazah Terakhir</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50">
                          <input 
                            type="file" 
                            className="hidden" 
                            id="ijazah" 
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileUpload('ijazah', e.target.files?.[0])}
                          />
                          <label htmlFor="ijazah" className="cursor-pointer flex flex-col items-center">
                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-600">Klik untuk upload</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</p>
                          </label>
                          {uploadedFiles.ijazah && (
                            <div className="mt-2 text-xs text-emerald-600 flex items-center">
                              <CheckCircle2 size={14} className="mr-1" />
                              {uploadedFiles.ijazah.name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Pas Foto 3x4</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50">
                          <input 
                            type="file" 
                            className="hidden" 
                            id="foto" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload('foto', e.target.files?.[0])}
                          />
                          <label htmlFor="foto" className="cursor-pointer flex flex-col items-center">
                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-sm text-gray-600">Klik untuk upload</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</p>
                          </label>
                          {uploadedFiles.foto && (
                            <div className="mt-2 text-xs text-emerald-600 flex items-center">
                              <CheckCircle2 size={14} className="mr-1" />
                              {uploadedFiles.foto.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Tambahkan informasi tambahan jika diperlukan"
                      rows={4}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleSaveDraft}>
                      Simpan Draft
                    </Button>
                    <Button type="button" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                      Submit Pendaftaran
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
