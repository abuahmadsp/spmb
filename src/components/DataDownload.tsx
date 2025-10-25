import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { useState } from 'react';

interface DataDownloadProps {
  userRole: string; // 'admin', 'school_admin'
  campusId?: string; // Hanya untuk school admin
}

export function DataDownload({ userRole, campusId }: DataDownloadProps) {
  const [downloadType, setDownloadType] = useState<'applicants' | 'students' | 'payments' | 'quotas'>('applicants');
  const [fileFormat, setFileFormat] = useState<'excel' | 'pdf'>('excel');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    
    try {
      // Dalam implementasi sebenarnya, ini akan menjadi API call ke backend
      // dengan parameter yang sesuai untuk menghasilkan file
      console.log(`Mengunduh data ${downloadType} dalam format ${fileFormat}`);
      console.log(`Peran pengguna: ${userRole}, Kampus: ${campusId || 'Semua Kampus'}`);
      
      // Simulasi delay untuk download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Di sini akan ada logika untuk:
      // 1. Membuat file (Excel/PDF) berdasarkan tipe dan format yang dipilih
      // 2. Mengirim file ke pengguna untuk diunduh
      // 3. Mencatat log download ke database
      
      alert(`File ${downloadType} dalam format ${fileFormat.toUpperCase()} berhasil diunduh!`);
    } catch (error) {
      console.error('Error saat mengunduh file:', error);
      alert('Terjadi kesalahan saat mengunduh file. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Opsi download berdasarkan peran pengguna
  const downloadOptions = userRole === 'admin' 
    ? [
        { value: 'applicants', label: 'Data Pendaftar' },
        { value: 'students', label: 'Data Murid' },
        { value: 'payments', label: 'Data Pembayaran' },
        { value: 'quotas', label: 'Data Kuota' }
      ]
    : [
        { value: 'applicants', label: 'Data Pendaftar' },
        { value: 'students', label: 'Data Murid' },
        { value: 'payments', label: 'Data Pembayaran' }
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Data</CardTitle>
        <CardDescription>
          Unduh data dalam format Excel atau PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipe Data</label>
            <Select value={downloadType} onValueChange={(value: 'applicants' | 'students' | 'payments' | 'quotas') => setDownloadType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {downloadOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Format File</label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={fileFormat === 'excel' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFileFormat('excel')}
                disabled={isLoading}
              >
                <FileSpreadsheet size={16} className="mr-2" />
                Excel
              </Button>
              <Button
                type="button"
                variant={fileFormat === 'pdf' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setFileFormat('pdf')}
                disabled={isLoading}
              >
                <File size={16} className="mr-2" />
                PDF
              </Button>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download size={16} className="mr-2" />
            {isLoading ? 'Mengunduh...' : 'Download Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}