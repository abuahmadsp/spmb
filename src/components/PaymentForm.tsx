import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Upload, CheckCircle, XCircle } from 'lucide-react';

interface PaymentFormProps {
  onBack: () => void;
  onNext: () => void;
  onNavigateLogin: () => void;
  selectedCampus: any;
}

export function PaymentForm({ onBack, onNext, onNavigateLogin, selectedCampus }: PaymentFormProps) {
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string | null>(null);
  const [registrationFee, setRegistrationFee] = useState<number>(250000); // Default biaya pendaftaran

  // Ambil informasi rekening berdasarkan kampus yang dipilih
  useEffect(() => {
    // Dalam implementasi sebenarnya, ini akan menjadi API call ke backend
    // Untuk simulasi, kita buat data dummy
    const mockBankAccount = {
      bank_name: 'Bank Syariah Indonesia',
      account_number: '1234567890',
      account_name: 'Yayasan Islam Al Kahfi Batam'
    };
    setBankAccount(mockBankAccount);
  }, [selectedCampus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofOfPayment(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofOfPaymentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Di sini Anda akan mengirim data pembayaran ke server
    // Untuk sekarang, kita langsung lanjut ke halaman berikutnya
    onNext();
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
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-emerald-800">Al Kahfi Batam</h1>
              <p className="text-sm text-gray-600">Form Pembayaran</p>
            </div>
          </div>
        </div>
      </header>

      {/* Payment Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 to-white">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Form Pembayaran Uang Pendaftaran</CardTitle>
              <CardDescription>
                Lakukan pembayaran uang pendaftaran dan unggah bukti pembayaran
              </CardDescription>
              
              {/* Display selected campus info */}
              {selectedCampus && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start gap-2 mb-2">
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Rekening */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Informasi Rekening Sekolah</h3>
                  {bankAccount ? (
                    <div className="space-y-2">
                      <p><span className="font-medium">Bank:</span> {bankAccount.bank_name}</p>
                      <p><span className="font-medium">No. Rekening:</span> {bankAccount.account_number}</p>
                      <p><span className="font-medium">Atas Nama:</span> {bankAccount.account_name}</p>
                      <p><span className="font-medium">Jumlah Pembayaran:</span> Rp {registrationFee.toLocaleString('id-ID')}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Memuat informasi rekening...</p>
                  )}
                </div>

                {/* Metode Pembayaran */}
                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPaymentMethod('bank_transfer')}
                    >
                      Transfer Bank
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPaymentMethod('cash')}
                      disabled
                    >
                      Tunai (Loket)
                    </Button>
                  </div>
                </div>

                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="proof-of-payment">Unggah Bukti Pembayaran</Label>
                      <div className="flex items-center space-x-4">
                        <Input 
                          id="proof-of-payment"
                          type="file" 
                          accept="image/*,application/pdf" 
                          onChange={handleFileChange}
                        />
                        <Button type="button" variant="outline">
                          <Upload size={16} className="mr-2" />
                          Pilih File
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">Format: JPG, PNG, atau PDF maksimal 2MB</p>
                    </div>

                    {proofOfPaymentPreview && (
                      <div className="mt-4">
                        <Label>Pratinjau Bukti Pembayaran</Label>
                        <div className="mt-2 border rounded-lg p-2 flex justify-center">
                          {proofOfPayment?.type?.startsWith('image/') ? (
                            <img 
                              src={proofOfPaymentPreview} 
                              alt="Pratinjau bukti pembayaran" 
                              className="max-h-60 object-contain"
                            />
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <XCircle size={48} className="mx-auto mb-2" />
                              <p>Pratinjau tidak tersedia untuk file ini</p>
                              <p>Nama file: {proofOfPayment?.name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Simpan dan Lanjutkan
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