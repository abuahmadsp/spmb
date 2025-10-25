-- Database Schema untuk Sistem Penerimaan Murid Baru (SPMB) Al Kahfi Batam

-- Tabel Users untuk menyimpan informasi akun pendaftar
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'applicant', -- 'applicant', 'school_admin', 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Schools untuk menyimpan informasi sekolah
CREATE TABLE schools (
    id TEXT PRIMARY KEY, -- 'tk', 'sd', 'smp', 'sma'
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL, -- 'PAUD', 'Dasar', 'Menengah Pertama', 'Menengah Atas'
    age TEXT NOT NULL, -- rentang usia
    icon TEXT NOT NULL, -- nama icon
    logo_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Campuses untuk menyimpan informasi kampus/sekolah cabang
CREATE TABLE campuses (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Tabel Applicants untuk menyimpan informasi pendaftar
CREATE TABLE applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    campus_id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    tk_class TEXT, -- 'tk-a' atau 'tk-b' jika sekolah TK
    is_verified BOOLEAN DEFAULT 0,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campus_id) REFERENCES campuses(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Tabel Student Data untuk menyimpan informasi detail murid
CREATE TABLE student_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    birth_place TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL, -- 'male', 'female'
    religion TEXT NOT NULL,
    nationality TEXT NOT NULL DEFAULT 'Indonesia',
    address TEXT NOT NULL,
    father_name TEXT NOT NULL,
    father_occupation TEXT,
    father_phone TEXT,
    mother_name TEXT NOT NULL,
    mother_occupation TEXT,
    mother_phone TEXT,
    guardian_name TEXT,
    guardian_occupation TEXT,
    guardian_phone TEXT,
    previous_school TEXT,
    previous_school_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id)
);

-- Tabel School Admins untuk menyimpan informasi admin sekolah
CREATE TABLE school_admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    campus_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

-- Tabel Quota untuk menyimpan informasi kuota masing-masing sekolah
CREATE TABLE quota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campus_id TEXT NOT NULL,
    school_id TEXT NOT NULL,
    class_type TEXT NOT NULL, -- 'tk-a', 'tk-b', 'male', 'female', 'ikhwan', 'akhwat'
    max_capacity INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campuses(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- Tabel Application Status History untuk melacak riwayat status pendaftaran
CREATE TABLE application_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'approved', 'rejected', 'enrolled'
    notes TEXT,
    changed_by INTEGER, -- user_id dari admin yang mengubah status
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Tabel untuk menyimpan berkas-berkas yang diunggah oleh pendaftar
CREATE TABLE application_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    document_type TEXT NOT NULL, -- 'photo', 'birth_certificate', 'previous_report', 'transfer_letter', etc
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT 0,
    verified_by INTEGER, -- user_id dari admin yang memverifikasi
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Tabel untuk menyimpan informasi pembayaran
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    payment_type TEXT NOT NULL, -- 'registration_fee', 'tuition_fee', etc
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT, -- 'bank_transfer', 'cash', etc
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    transaction_id TEXT,
    payment_date DATETIME,
    proof_of_payment_path TEXT, -- path ke bukti pembayaran
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id)
);

-- Tabel untuk menyimpan informasi rekening sekolah
CREATE TABLE school_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campus_id TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
);

-- Tabel untuk menyimpan log download data oleh admin
CREATE TABLE download_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    download_type TEXT NOT NULL, -- 'excel', 'pdf'
    file_format TEXT NOT NULL, -- 'xlsx', 'xls', 'pdf'
    report_type TEXT NOT NULL, -- 'applicants', 'students', 'payments', etc
    download_params TEXT, -- parameter filter dalam format JSON
    file_path TEXT, -- path tempat file disimpan sementara
    download_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indeks untuk optimasi query
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applicants_user_id ON applicants(user_id);
CREATE INDEX idx_applicants_campus_id ON applicants(campus_id);
CREATE INDEX idx_applicants_school_id ON applicants(school_id);
CREATE INDEX idx_student_data_applicant_id ON student_data(applicant_id);
CREATE INDEX idx_quota_campus_id ON quota(campus_id);
CREATE INDEX idx_quota_school_id ON quota(school_id);
CREATE INDEX idx_school_admins_user_id ON school_admins(user_id);
CREATE INDEX idx_school_admins_campus_id ON school_admins(campus_id);
CREATE INDEX idx_application_status_history_applicant_id ON application_status_history(applicant_id);
CREATE INDEX idx_application_documents_applicant_id ON application_documents(applicant_id);
CREATE INDEX idx_payments_applicant_id ON payments(applicant_id);
CREATE INDEX idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX idx_download_logs_created_at ON download_logs(created_at);

-- Trigger untuk memperbarui timestamp saat record diupdate
CREATE TRIGGER update_timestamp_users 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_timestamp_schools 
AFTER UPDATE ON schools
BEGIN
    UPDATE schools SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_timestamp_campuses 
AFTER UPDATE ON campuses
BEGIN
    UPDATE campuses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_timestamp_applicants 
AFTER UPDATE ON applicants
BEGIN
    UPDATE applicants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_timestamp_student_data 
AFTER UPDATE ON student_data
BEGIN
    UPDATE student_data SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_timestamp_school_admins 
AFTER UPDATE ON school_admins
BEGIN
    UPDATE school_admins SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_timestamp_quota 
AFTER UPDATE ON quota
BEGIN
    UPDATE quota SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Contoh data awal
-- Insert data sekolah
INSERT INTO schools (id, name, full_name, description, level, age, icon, logo_path) VALUES
('tk', 'TK IT Fajar Ilahi', 'Taman Kanak-Kanak Islam Terpadu Fajar Ilahi', 'Taman Kanak-Kanak Islam Terpadu Fajar Ilahi belajar menyenangkan dan bermakna.', 'PAUD', 'TK A 4 Tahun - TK B 5 Tahun', 'School', '/logos/Logo FI TK.png'),
('sd', 'SD IT Fajar Ilahi', 'Sekolah Dasar Islam Terpadu Fajar Ilahi', 'Pendidikan dasar yang mengintegrasikan kurikulum nasional dengan nilai-nilai Islam', 'Dasar', '6-12 tahun', 'BookOpen', '/logos/logo FI SD.png'),
('smp', 'SMP IT Fajar Ilahi', 'Sekolah Menengah Pertama Islam Terpadu Fajar Ilahi', 'Pendidikan menengah pertama dengan pendalaman ilmu agama dan umum', 'Menengah Pertama', '13-15 tahun', 'Users', '/logos/logo FI SMP.png'),
('sma', 'SMA IT Fajar Ilahi', 'Sekolah Menengah Atas Islam Terpadu Fajar Ilahi', 'Pendidikan menengah atas untuk mempersiapkan murid ke jenjang perguruan tinggi', 'Menengah Atas', '16-18 tahun', 'GraduationCap', '/logos/Logo FI SMA.png');

-- Insert data kampus
INSERT INTO campuses (id, school_id, name, location, address) VALUES
('tk-batu-aji', 'tk', 'TK IT Fajar Ilahi Batu Aji', 'Batu Aji', 'Jl. Pendidikan No. 1, Batu Aji, Batam'),
('tk-bengkong', 'tk', 'TK IT Fajar Ilahi Bengkong', 'Bengkong', 'Jl. Raya Bengkong No. 45, Bengkong, Batam'),
('sd-batu-aji', 'sd', 'SD IT Fajar Ilahi Batu Aji', 'Batu Aji', 'Jl. Pendidikan No. 2, Batu Aji, Batam'),
('sd-bengkong', 'sd', 'SD IT Fajar Ilahi Bengkong', 'Bengkong', 'Jl. Raya Bengkong No. 46, Bengkong, Batam'),
('sd-sei-beduk', 'sd', 'SD IT Fajar Ilahi Sei Beduk', 'Sei Beduk', 'Jl. Sei Beduk Raya No. 10, Sei Beduk, Batam'),
('smp-batu-aji', 'smp', 'SMP IT Fajar Ilahi Batu Aji', 'Batu Aji', 'Jl. Pendidikan No. 3, Batu Aji, Batam'),
('smp-bengkong', 'smp', 'SMP IT Fajar Ilahi Bengkong', 'Bengkong', 'Jl. Raya Bengkong No. 47, Bengkong, Batam'),
('smp-sei-beduk', 'smp', 'SMP IT Fajar Ilahi Sei Beduk', 'Sei Beduk', 'Jl. Sei Beduk Raya No. 11, Sei Beduk, Batam'),
('sma-batu-aji', 'sma', 'SMA IT Fajar Ilahi Batu Aji', 'Batu Aji', 'Jl. Pendidikan No. 4, Batu Aji, Batam'),
('sma-bengkong', 'sma', 'SMA IT Fajar Ilahi Bengkong', 'Bengkong', 'Jl. Raya Bengkong No. 48, Bengkong, Batam'),
('sma-sei-beduk', 'sma', 'SMA IT Fajar Ilahi Sei Beduk', 'Sei Beduk', 'Jl. Sei Beduk Raya No. 12, Sei Beduk, Batam');

-- Insert data kuota
-- Kuota untuk TK (TK A 18 murid dan TK B 45 murid)
INSERT INTO quota (campus_id, school_id, class_type, max_capacity) VALUES
('tk-batu-aji', 'tk', 'tk-a', 18),
('tk-batu-aji', 'tk', 'tk-b', 45),
('tk-bengkong', 'tk', 'tk-a', 18),
('tk-bengkong', 'tk', 'tk-b', 45);

-- Kuota untuk SD (Laki-Laki 60 murid dan Perempuan 60 murid)
INSERT INTO quota (campus_id, school_id, class_type, max_capacity) VALUES
('sd-batu-aji', 'sd', 'male', 60),
('sd-batu-aji', 'sd', 'female', 60),
('sd-bengkong', 'sd', 'male', 60),
('sd-bengkong', 'sd', 'female', 60),
('sd-sei-beduk', 'sd', 'male', 60),
('sd-sei-beduk', 'sd', 'female', 60);

-- Kuota untuk SMP (Laki-Laki 75 murid dan Perempuan 75 murid)
INSERT INTO quota (campus_id, school_id, class_type, max_capacity) VALUES
('smp-batu-aji', 'smp', 'male', 75),
('smp-batu-aji', 'smp', 'female', 75),
('smp-bengkong', 'smp', 'male', 75),
('smp-bengkong', 'smp', 'female', 75),
('smp-sei-beduk', 'smp', 'male', 75),
('smp-sei-beduk', 'smp', 'female', 75);

-- Kuota untuk SMA (Laki-Laki 30 murid dan Perempuan 30 murid)
INSERT INTO quota (campus_id, school_id, class_type, max_capacity) VALUES
('sma-batu-aji', 'sma', 'male', 30),
('sma-batu-aji', 'sma', 'female', 30),
('sma-bengkong', 'sma', 'male', 30),
('sma-bengkong', 'sma', 'female', 30),
('sma-sei-beduk', 'sma', 'male', 30),
('sma-sei-beduk', 'sma', 'female', 30);

-- Insert data rekening sekolah
INSERT INTO school_accounts (campus_id, bank_name, account_number, account_name) VALUES
('tk-batu-aji', 'Bank Syariah Indonesia', '1234567890', 'Yayasan Islam Al Kahfi Batam - TK Batu Aji'),
('tk-bengkong', 'Bank Syariah Indonesia', '1234567891', 'Yayasan Islam Al Kahfi Batam - TK Bengkong'),
('sd-batu-aji', 'Bank Syariah Indonesia', '1234567892', 'Yayasan Islam Al Kahfi Batam - SD Batu Aji'),
('sd-bengkong', 'Bank Syariah Indonesia', '1234567893', 'Yayasan Islam Al Kahfi Batam - SD Bengkong'),
('sd-sei-beduk', 'Bank Syariah Indonesia', '1234567894', 'Yayasan Islam Al Kahfi Batam - SD Sei Beduk'),
('smp-batu-aji', 'Bank Syariah Indonesia', '1234567895', 'Yayasan Islam Al Kahfi Batam - SMP Batu Aji'),
('smp-bengkong', 'Bank Syariah Indonesia', '1234567896', 'Yayasan Islam Al Kahfi Batam - SMP Bengkong'),
('smp-sei-beduk', 'Bank Syariah Indonesia', '1234567897', 'Yayasan Islam Al Kahfi Batam - SMP Sei Beduk'),
('sma-batu-aji', 'Bank Syariah Indonesia', '1234567898', 'Yayasan Islam Al Kahfi Batam - SMA Batu Aji'),
('sma-bengkong', 'Bank Syariah Indonesia', '1234567899', 'Yayasan Islam Al Kahfi Batam - SMA Bengkong'),
('sma-sei-beduk', 'Bank Syariah Indonesia', '1234567900', 'Yayasan Islam Al Kahfi Batam - SMA Sei Beduk');