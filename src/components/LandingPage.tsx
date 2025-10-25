import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { GraduationCap, BookOpen, Users, School, MapPin, ArrowRight, Menu } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateSchoolAdminLogin: () => void;
}

interface Campus {
  id: string;
  name: string;
  location: string;
  address: string;
}

interface SchoolLevel {
  id: string;
  name: string;
  fullName: string;
  description: string;
  level: string;
  age: string;
  icon: any;
  logoPath: string; // Path to the logo image
  campuses: Campus[];
}

export function LandingPage({ onNavigateLogin, onNavigateRegister, onNavigateSchoolAdminLogin }: LandingPageProps) {
  const [selectedSchool, setSelectedSchool] = useState<SchoolLevel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const schools: SchoolLevel[] = [
    {
      id: 'tk',
      name: 'TK IT Fajar Ilahi',
      fullName: 'Taman Kanak-kanak Islam Terpadu Fajar Ilahi',
      description: 'Taman Kanak-Kanak Islam Terpadu Fajar Ilahi belajar menyenangkan dan bermakna.',
      level: 'PAUD',
      age: 'TK A 4 Tahun - TK B 5 Tahun',
      icon: School,
      logoPath: '/logos/Logo FI TK.png',
      campuses: [
        {
          id: 'tk-batu-aji',
          name: 'TK IT Fajar Ilahi Batu Aji',
          location: 'Batu Aji',
          address: 'Jl. Pendidikan No. 1, Batu Aji, Batam'
        },
        {
          id: 'tk-bengkong',
          name: 'TK IT Fajar Ilahi Bengkong',
          location: 'Bengkong',
          address: 'Jl. Raya Bengkong No. 45, Bengkong, Batam'
        }
      ]
    },
    {
      id: 'sd',
      name: 'SD IT Fajar Ilahi',
      fullName: 'Sekolah Dasar Islam Terpadu Fajar Ilahi',
      description: 'Pendidikan dasar yang mengintegrasikan kurikulum nasional dengan nilai-nilai Islam',
      level: 'Dasar',
      age: '6-12 tahun',
      icon: BookOpen,
      logoPath: '/logos/logo FI SD.png',
      campuses: [
        {
          id: 'sd-batu-aji',
          name: 'SD IT Fajar Ilahi Batu Aji',
          location: 'Batu Aji',
          address: 'Jl. Pendidikan No. 2, Batu Aji, Batam'
        },
        {
          id: 'sd-bengkong',
          name: 'SD IT Fajar Ilahi Bengkong',
          location: 'Bengkong',
          address: 'Jl. Raya Bengkong No. 46, Bengkong, Batam'
        },
        {
          id: 'sd-sei-beduk',
          name: 'SD IT Fajar Ilahi Sei Beduk',
          location: 'Sei Beduk',
          address: 'Jl. Sei Beduk Raya No. 10, Sei Beduk, Batam'
        }
      ]
    },
    {
      id: 'smp',
      name: 'SMP IT Fajar Ilahi',
      fullName: 'Sekolah Menengah Pertama Islam Terpadu Fajar Ilahi',
      description: 'Pendidikan menengah pertama dengan pendalaman ilmu agama dan umum',
      level: 'Menengah Pertama',
      age: '13-15 tahun',
      icon: Users,
      logoPath: '/logos/logo FI SMP.png',
      campuses: [
        {
          id: 'smp-batu-aji',
          name: 'SMP IT Fajar Ilahi Batu Aji',
          location: 'Batu Aji',
          address: 'Jl. Pendidikan No. 3, Batu Aji, Batam'
        },
        {
          id: 'smp-bengkong',
          name: 'SMP IT Fajar Ilahi Bengkong',
          location: 'Bengkong',
          address: 'Jl. Raya Bengkong No. 47, Bengkong, Batam'
        },
        {
          id: 'smp-sei-beduk',
          name: 'SMP IT Fajar Ilahi Sei Beduk',
          location: 'Sei Beduk',
          address: 'Jl. Sei Beduk Raya No. 11, Sei Beduk, Batam'
        }
      ]
    },
    {
      id: 'sma',
      name: 'SMA IT Fajar Ilahi',
      fullName: 'Sekolah Menengah Atas Islam Terpadu Fajar Ilahi',
      description: 'Pendidikan menengah atas untuk mempersiapkan murid ke jenjang perguruan tinggi',
      level: 'Menengah Atas',
      age: '16-18 tahun',
      icon: GraduationCap,
      logoPath: '/logos/Logo FI SMA.png',
      campuses: [
        {
          id: 'sma-batu-aji',
          name: 'SMA IT Fajar Ilahi Batu Aji',
          location: 'Batu Aji',
          address: 'Jl. Pendidikan No. 4, Batu Aji, Batam'
        },
        {
          id: 'sma-bengkong',
          name: 'SMA IT Fajar Ilahi Bengkong',
          location: 'Bengkong',
          address: 'Jl. Raya Bengkong No. 48, Bengkong, Batam'
        },
        {
          id: 'sma-sei-beduk',
          name: 'SMA IT Fajar Ilahi Sei Beduk',
          location: 'Sei Beduk',
          address: 'Jl. Sei Beduk Raya No. 12, Sei Beduk, Batam'
        }
      ]
    }
  ];

  const handleSchoolClick = (school: SchoolLevel) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };

  const handleCampusSelect = (campus: Campus) => {
    // Store the selected campus information and navigate to registration
    sessionStorage.setItem('selectedCampus', JSON.stringify({
      schoolLevel: selectedSchool?.id,
      schoolName: selectedSchool?.name,
      campusId: campus.id,
      campusName: campus.name,
      campusLocation: campus.location
    }));
    setIsModalOpen(false);
    onNavigateRegister();
  };

  // Fungsi untuk mengecek apakah kuota telah terpenuhi berdasarkan jenjang pendidikan
  // Dalam implementasi sebenarnya, ini akan mengambil data dari server
  const isQuotaFull = (campus: Campus, schoolLevel: string) => {
    // Dalam implementasi sebenarnya, Anda perlu mengambil data jumlah pendaftar dari server
    // dan membandingkannya dengan kuota maksimum masing-masing jenjang
    // Untuk simulasi, kita buat beberapa kondisi berdasarkan jenjang
    
    if (schoolLevel === 'tk') {
      // Misalnya, jika total pendaftar untuk TK A dan TK B sudah mencapai 63 (18+45)
      // Dalam implementasi nyata, Anda akan menghitung berdasarkan data pendaftar sebenarnya
      return false; // Secara default, kuota belum penuh
    } else if (schoolLevel === 'sd') {
      // Misalnya, jika total pendaftar untuk Kelas Ikhwan dan Akhwat sudah mencapai 120 (60+60)
      return false; // Secara default, kuota belum penuh
    } else if (schoolLevel === 'smp') {
      // Jika total pendaftar untuk Laki-laki dan Perempuan sudah mencapai 150 (75+75)
      return false; // Secara default, kuota belum penuh
    } else if (schoolLevel === 'sma') {
      // Jika total pendaftar untuk Laki-laki dan Perempuan sudah mencapai 60 (30+30)
      return false; // Secara default, kuota belum penuh
    }
    return false; // Secara default, kuota belum penuh
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center">
                <img 
                  src="/logos/logoyayasan.png" 
                  alt="Yayasan Islam Al Kahfi Batam" 
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Desktop Title */}
              <div className="hidden md:block">
                <h1 className="text-emerald-800">Yayasan Islam Al Kahfi Batam</h1>
                <p className="text-sm text-gray-600">Sistem Penerimaan Murid Baru (SPMB)</p>
              </div>
              {/* Mobile Title */}
              <div className="md:hidden">
                <h1 className="text-emerald-800">SPMB</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-3">
              <Button variant="ghost" onClick={onNavigateSchoolAdminLogin} className="text-emerald-700">
                Admin Sekolah
              </Button>
              <Button variant="outline" onClick={onNavigateLogin}>
                Login
              </Button>
              <Button onClick={onNavigateRegister} className="bg-emerald-600 hover:bg-emerald-700">
                Daftar Sekarang
              </Button>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="text-emerald-700" size={24} />
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-emerald-800">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      onNavigateSchoolAdminLogin();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="text-emerald-700 justify-start"
                  >
                    Admin Sekolah
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onNavigateLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      onNavigateRegister();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="bg-emerald-600 hover:bg-emerald-700 justify-start"
                  >
                    Daftar Sekarang
                  </Button>
                </div>
              </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1718218813922-bd2cf9dc5e40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpc2xhbWljJTIwc2Nob29sJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzYwNTg2MDk0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Islamic School"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Selamat Datang di SPMB Al Kahfi Batam</h2>
            <p className="text-xl mb-8 text-emerald-50">
              Bergabunglah dengan lembaga pendidikan Islam yang berkualitas dan berakhlak mulia. 
              Kami membuka kesempatan untuk calon murid baru tahun ajaran 2025/2026.
            </p>
            <Button 
              size="lg" 
              onClick={onNavigateRegister}
              className="bg-white text-emerald-700 hover:bg-emerald-50"
            >
              Mulai Pendaftaran
            </Button>
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-emerald-800 mb-3">Pilihan Jenjang Pendidikan</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pilih jenjang pendidikan yang sesuai untuk calon murid. Klik pada kartu untuk melihat 
            pilihan sekolah yang tersedia di setiap jenjang.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {schools.map((school) => (
            <Card 
              key={school.id} 
              className="hover:shadow-xl transition-all cursor-pointer hover:scale-105 duration-300 border-2 hover:border-emerald-500"
              onClick={() => handleSchoolClick(school)}
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                {/* Logo placeholder - Replace with actual logo */}
                <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <ImageWithFallback 
                    src={school.logoPath}
                    alt={school.name}
                    className="w-28 h-28 object-contain p-2"
                  />
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                  {school.campuses.length} Sekolah
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <school.icon className="text-emerald-700" size={20} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <p className="text-sm text-gray-500">{school.age}</p>
                  </div>
                </div>
                <CardDescription>{school.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSchoolClick(school);
                  }}
                >
                  Pilih Sekolah
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Campus Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-emerald-800">
              {selectedSchool?.fullName}
            </DialogTitle>
            <DialogDescription>
              Pilih sekolah yang Anda inginkan untuk mendaftar
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {selectedSchool?.campuses.map((campus) => (
              <Card 
                key={campus.id}
                className="hover:shadow-lg transition-all cursor-pointer hover:border-emerald-500 border-2"
                onClick={() => handleCampusSelect(campus)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <MapPin className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                    <span>{campus.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="text-gray-700">{campus.location}</p>
                  </div>
                  {selectedSchool?.id === 'tk' && (
                    <div>
                      <p className="text-sm text-gray-500">Kuota</p>
                      <p className="text-sm text-gray-700">TK A 18 murid dan TK B 45 murid</p>
                    </div>
                  )}
                  {selectedSchool?.id === 'sd' && (
                    <div>
                      <p className="text-sm text-gray-500">Kuota</p>
                      <p className="text-sm text-gray-700">Laki-Laki 60 murid dan Perempuan 60 murid</p>
                    </div>
                  )}
                  {selectedSchool?.id === 'smp' && (
                    <div>
                      <p className="text-sm text-gray-500">Kuota</p>
                      <p className="text-sm text-gray-700">Laki-Laki 75 murid dan Perempuan 75 murid</p>
                    </div>
                  )}
                  {selectedSchool?.id === 'sma' && (
                    <div>
                      <p className="text-sm text-gray-500">Kuota</p>
                      <p className="text-sm text-gray-700">Laki-Laki 30 murid dan Perempuan 30 murid</p>
                    </div>
                  )}
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCampusSelect(campus);
                    }}
                    disabled={selectedSchool && isQuotaFull(campus, selectedSchool.id)}
                  >
                    {selectedSchool && isQuotaFull(campus, selectedSchool.id) ? 'Kuota Terpenuhi' : 'Pilih Sekolah Ini'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-emerald-800 mb-3">Mengapa Memilih Al Kahfi?</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-emerald-700" size={32} />
              </div>
              <h4 className="mb-2">Kurikulum Terintegrasi</h4>
              <p className="text-gray-600">
                Menggabungkan kurikulum nasional dengan pendidikan agama Islam yang komprehensif
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-emerald-700" size={32} />
              </div>
              <h4 className="mb-2">Tenaga Pengajar Berkualitas</h4>
              <p className="text-gray-600">
                Guru-guru profesional dan berpengalaman dengan dedikasi tinggi
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="text-emerald-700" size={32} />
              </div>
              <h4 className="mb-2">Fasilitas Lengkap</h4>
              <p className="text-gray-600">
                Sarana dan prasarana modern untuk mendukung proses pembelajaran
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-100">
            © 2025 Yayasan Islam Al Kahfi Batam. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
