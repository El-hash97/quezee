export type Role = "ADMIN" | "PARTICIPANT";

export interface User {
  noreg: string; name: string; line: string; division: string;
  role: Role; totalPoints: number; attempts: number; level: number;
}

export interface QuizAttempt {
  id: number; noreg: string; attemptNumber: number;
  correctAnswers: number; wrongAnswers: number;
  pointsEarned: number; createdAt: string; topic: string;
}

export interface Material {
  id: string; title: string; category: "seven-tools" | "8-steps";
  icon: string; description: string; readTime: number; color: string; content: string;
}

export interface Question {
  id: number; materialId: string; question: string;
  options: string[]; correctIndex: number; explanation: string;
}

export const CURRENT_USER: User = {
  noreg: "1234567", name: "Budi Santoso", line: "MELTING",
  division: "RED", role: "PARTICIPANT", totalPoints: 875, attempts: 14, level: 4,
};

export const CURRENT_ADMIN: User = {
  noreg: "0000001", name: "Rini Wulandari", line: "ENGINEERING",
  division: "WHITE", role: "ADMIN", totalPoints: 0, attempts: 0, level: 0,
};

export const USERS: User[] = [
  { noreg: "1234567", name: "Budi Santoso",    line: "MELTING",     division: "RED",   role: "PARTICIPANT", totalPoints: 875,  attempts: 14, level: 4 },
  { noreg: "2345678", name: "Dewi Rahayu",     line: "MELTING",     division: "WHITE", role: "PARTICIPANT", totalPoints: 960,  attempts: 16, level: 4 },
  { noreg: "3456789", name: "Agus Pramono",    line: "CORE MAKING", division: "RED",   role: "PARTICIPANT", totalPoints: 1120, attempts: 20, level: 5 },
  { noreg: "4567890", name: "Siti Nurbaya",    line: "CORE MAKING", division: "WHITE", role: "PARTICIPANT", totalPoints: 740,  attempts: 12, level: 3 },
  { noreg: "5678901", name: "Eko Kurniawan",   line: "MOULDING",    division: "RED",   role: "PARTICIPANT", totalPoints: 1285, attempts: 23, level: 6 },
  { noreg: "6789012", name: "Fitri Handayani", line: "MOULDING",    division: "WHITE", role: "PARTICIPANT", totalPoints: 995,  attempts: 17, level: 4 },
  { noreg: "7890123", name: "Hendra Wijaya",   line: "FINISHING",   division: "RED",   role: "PARTICIPANT", totalPoints: 650,  attempts: 11, level: 3 },
  { noreg: "8901234", name: "Ika Permata",     line: "FINISHING",   division: "WHITE", role: "PARTICIPANT", totalPoints: 1350, attempts: 25, level: 6 },
  { noreg: "9012345", name: "Joko Susilo",     line: "DIE PRESS",   division: "RED",   role: "PARTICIPANT", totalPoints: 820,  attempts: 13, level: 4 },
  { noreg: "9123456", name: "Kartini Dewi",    line: "DIE PRESS",   division: "WHITE", role: "PARTICIPANT", totalPoints: 1080, attempts: 19, level: 5 },
  { noreg: "9234567", name: "Lukman Hakim",    line: "MAINTENANCE", division: "RED",   role: "PARTICIPANT", totalPoints: 590,  attempts: 10, level: 3 },
  { noreg: "9345678", name: "Maya Sari",       line: "ENGINEERING", division: "WHITE", role: "PARTICIPANT", totalPoints: 1190, attempts: 21, level: 5 },
];

export const MATERIALS: Material[] = [
  { id: "check-sheet", title: "Check Sheet", category: "seven-tools", icon: "📋", color: "#4F8EF7",
    description: "Lembar pemeriksaan sistematis untuk mengumpulkan dan mengorganisir data secara efisien di lini produksi.", readTime: 8,
    content: `## Apa itu Check Sheet?\n\nCheck Sheet (Lembar Periksa) adalah formulir terstruktur yang dirancang khusus untuk memudahkan pengumpulan dan pencatatan data secara sistematis dan efisien.\n\n### Kegunaan Utama\n- Mencatat frekuensi kejadian\n- Mengumpulkan data cacat produksi\n- Melacak lokasi masalah\n- Memantau distribusi proses\n\n### Cara Membuat Check Sheet\n1. Tentukan tujuan pengumpulan data\n2. Identifikasi jenis data yang diperlukan\n3. Rancang format yang mudah diisi\n4. Tetapkan periode pengumpulan data\n5. Uji coba formulir sebelum implementasi penuh\n\n### Tips Penggunaan Efektif\n- Gunakan simbol tally yang mudah dihitung\n- Sertakan kolom tanggal dan shift\n- Pastikan semua kategori mencakup semua kemungkinan masalah` },
  { id: "histogram", title: "Histogram", category: "seven-tools", icon: "📊", color: "#10B981",
    description: "Grafik batang untuk menampilkan distribusi frekuensi data dan variasi proses produksi.", readTime: 10,
    content: `## Histogram dalam Konteks QCC\n\nHistogram adalah representasi grafis dari distribusi data numerik yang menunjukkan seberapa sering nilai dalam rentang tertentu muncul dalam sebuah dataset.\n\n### Mengapa Histogram Penting?\nHistogram membantu tim QCC untuk:\n- Memahami distribusi data proses\n- Mengidentifikasi apakah proses berada dalam batas kendali\n- Mendeteksi penyimpangan dari nilai target\n- Membandingkan performa sebelum dan sesudah perbaikan\n\n### Interpretasi Bentuk Histogram\n- **Simetris/Bell-shaped**: Proses normal, stabil\n- **Skew kanan**: Banyak nilai rendah, sedikit nilai tinggi\n- **Skew kiri**: Banyak nilai tinggi, sedikit nilai rendah\n- **Bimodal**: Dua puncak, kemungkinan dua proses berbeda` },
  { id: "pareto", title: "Diagram Pareto", category: "seven-tools", icon: "📈", color: "#F59E0B",
    description: "Prinsip 80/20 untuk mengidentifikasi faktor-faktor utama yang paling berkontribusi pada masalah kualitas.", readTime: 12,
    content: `## Diagram Pareto — Prinsip 80/20\n\nDiagram Pareto menggabungkan grafik batang dengan garis kumulatif untuk menunjukkan kontribusi relatif setiap kategori masalah terhadap total masalah.\n\n### Prinsip Pareto\nSekitar **80% masalah** berasal dari **20% penyebab**. Dengan memfokuskan upaya perbaikan pada 20% penyebab utama, tim dapat memberikan dampak maksimal.\n\n### Langkah Pembuatan\n1. Identifikasi dan kategorikan masalah\n2. Hitung frekuensi setiap kategori\n3. Urutkan dari tertinggi ke terendah\n4. Hitung persentase kumulatif\n5. Plot batang dan garis kumulatif` },
  { id: "fishbone", title: "Diagram Tulang Ikan", category: "seven-tools", icon: "🐟", color: "#818CF8",
    description: "Diagram sebab-akibat untuk menganalisis akar permasalahan menggunakan kategori 4M + 1E.", readTime: 15,
    content: `## Diagram Ishikawa / Fishbone\n\nDiagram Fishbone adalah alat visual untuk mengidentifikasi, mengorganisir, dan menampilkan kemungkinan penyebab dari suatu masalah.\n\n### Kategori 4M + 1E\n1. **Man** (Manusia): Keterampilan, pelatihan, motivasi\n2. **Machine** (Mesin): Kondisi, kalibrasi, pemeliharaan\n3. **Method** (Metode): Prosedur, instruksi kerja, SOP\n4. **Material** (Material): Bahan baku, spesifikasi, penyimpanan\n5. **Environment** (Lingkungan): Suhu, kelembaban, kebersihan\n\n### Cara Menggunakannya\n1. Definisikan masalah dengan jelas\n2. Identifikasi kategori utama\n3. Brainstorming penyebab potensial\n4. Analisis dengan teknik "5 Why"\n5. Prioritaskan penyebab untuk investigasi` },
  { id: "scatter", title: "Scatter Diagram", category: "seven-tools", icon: "🔵", color: "#F87171",
    description: "Diagram pencar untuk menentukan hubungan dan korelasi antara dua variabel dalam proses.", readTime: 10,
    content: `## Scatter Diagram (Diagram Pencar)\n\nScatter Diagram digunakan untuk menyelidiki hubungan antara dua variabel yang berbeda dan menentukan apakah ada korelasi di antara keduanya.\n\n### Jenis Korelasi\n- **Korelasi positif kuat**: Titik-titik membentuk garis naik ke kanan\n- **Korelasi negatif kuat**: Titik-titik membentuk garis turun ke kanan\n- **Tidak ada korelasi**: Titik-titik tersebar acak\n\n### Aplikasi di Produksi\n- Hubungan suhu mesin vs tingkat reject\n- Hubungan kecepatan produksi vs cacat produk\n- Hubungan umur cetakan vs dimensi produk\n\n### Minimal 30 pasang data diperlukan untuk analisis yang valid.` },
  { id: "control-chart", title: "Control Chart", category: "seven-tools", icon: "📉", color: "#34D399",
    description: "Peta kendali statistik untuk memantau stabilitas dan konsistensi proses produksi dari waktu ke waktu.", readTime: 14,
    content: `## Control Chart (Peta Kendali)\n\nControl Chart adalah grafik garis yang digunakan untuk memantau apakah suatu proses berada dalam kondisi terkendali secara statistik.\n\n### Komponen Utama\n- **Center Line (CL)**: Rata-rata proses\n- **Upper Control Limit (UCL)**: Rata-rata + 3σ\n- **Lower Control Limit (LCL)**: Rata-rata - 3σ\n\n### Sinyal Out-of-Control\n1. Satu titik melampaui UCL atau LCL\n2. Tujuh titik berturut-turut di satu sisi CL\n3. Tujuh titik berurutan naik atau turun\n\n### Jenis Control Chart\n- **X-bar & R Chart**: Untuk data variabel\n- **p-Chart**: Untuk proporsi produk defektif\n- **c-Chart**: Untuk jumlah cacat per unit` },
  { id: "stratifikasi", title: "Stratifikasi", category: "seven-tools", icon: "🗂️", color: "#A78BFA",
    description: "Teknik pemilahan data berdasarkan sumber, kategori, atau karakteristik untuk analisis mendalam.", readTime: 8,
    content: `## Stratifikasi Data\n\nStratifikasi adalah proses membagi data menjadi subkelompok berdasarkan karakteristik tertentu untuk analisis yang lebih mendalam.\n\n### Tujuan Stratifikasi\n- Mengungkap perbedaan antar kelompok yang tersembunyi\n- Mengidentifikasi sumber variasi\n- Memfokuskan perbaikan pada area yang tepat\n\n### Faktor Stratifikasi Umum\n- **Mesin**: Mesin A, B, C\n- **Shift**: Pagi, Siang, Malam\n- **Material**: Batch yang berbeda\n- **Lokasi**: Line A, B, C, D\n\n### Contoh Aplikasi\nData reject = 150 unit. Setelah distratifikasi per shift:\n- Shift Pagi: 20 unit (13%)\n- Shift Siang: 35 unit (23%)\n- Shift Malam: 95 unit (64%)\n\nMasalah utama teridentifikasi di shift malam!` },
  { id: "langkah-1", title: "Langkah 1: Identifikasi Masalah", category: "8-steps", icon: "🔍", color: "#F59E0B",
    description: "Menentukan dan mendefinisikan masalah kualitas yang akan dipecahkan secara objektif dan terukur.", readTime: 10,
    content: `## Langkah 1 — Identifikasi Masalah\n\nLangkah pertama dalam 8 Steps adalah mengidentifikasi dan mendefinisikan masalah secara jelas dan terukur.\n\n### Kriteria Masalah yang Baik (SMART)\n- **Specific**: Spesifik dan jelas\n- **Measurable**: Dapat diukur secara kuantitatif\n- **Achievable**: Dapat diselesaikan dalam kapasitas tim\n- **Relevant**: Relevan dengan target perusahaan\n- **Time-bound**: Ada batasan waktu penyelesaian\n\n### Output Langkah 1\n- Pernyataan masalah yang terukur\n- Data historis yang mendukung\n- Justifikasi kenapa masalah ini dipilih` },
  { id: "langkah-2", title: "Langkah 2: Analisis Situasi", category: "8-steps", icon: "📊", color: "#4F8EF7",
    description: "Mengumpulkan dan menganalisis data untuk memahami kondisi aktual proses saat ini.", readTime: 12,
    content: `## Langkah 2 — Analisis Situasi\n\nLangkah ini bertujuan untuk memahami kondisi aktual dengan mengumpulkan fakta dan data yang akurat.\n\n### Aktivitas Utama\n1. **Gemba Walk**: Observasi langsung di lapangan\n2. **Data Collection**: Pengumpulan data aktual\n3. **Process Mapping**: Pemetaan alur proses\n\n### Pertanyaan Kunci\n- Kapan masalah terjadi? (Waktu)\n- Di mana masalah terjadi? (Lokasi)\n- Seberapa sering? (Frekuensi)\n- Seberapa besar dampaknya? (Magnitude)` },
  { id: "langkah-3", title: "Langkah 3: Analisis Sebab Akibat", category: "8-steps", icon: "🐟", color: "#818CF8",
    description: "Mencari dan memverifikasi akar penyebab masalah menggunakan 5 Why dan Fishbone Diagram.", readTime: 15,
    content: `## Langkah 3 — Analisis Sebab Akibat\n\nLangkah ini berfokus pada penggalian akar penyebab (root cause) dari masalah yang telah diidentifikasi.\n\n### Teknik 5 Why\nBertanya "mengapa" berulang kali (minimal 5x) hingga menemukan akar penyebab sesungguhnya.\n\n**Contoh:**\n1. Mengapa produk reject? → Dimensi tidak sesuai\n2. Mengapa dimensi tidak sesuai? → Setting mesin bergeser\n3. Mengapa setting bergeser? → Baut pengunci kendor\n4. Mengapa baut kendor? → Tidak ada jadwal pengecekan\n5. **Root Cause**: Belum ada SOP perawatan harian\n\n### Verifikasi Penyebab\nSetiap penyebab potensial harus diverifikasi dengan data sebelum ditetapkan sebagai akar masalah.` },
  { id: "langkah-4", title: "Langkah 4: Rencana Perbaikan", category: "8-steps", icon: "📝", color: "#10B981",
    description: "Menyusun rencana tindakan perbaikan yang sistematis berdasarkan akar penyebab teridentifikasi.", readTime: 10,
    content: `## Langkah 4 — Rencana Perbaikan\n\n### Format 5W1H\n- **What**: Apa yang akan dilakukan?\n- **Why**: Mengapa ini solusinya?\n- **Where**: Di mana akan dilakukan?\n- **When**: Kapan akan dilaksanakan?\n- **Who**: Siapa yang bertanggung jawab?\n- **How**: Bagaimana caranya?\n\n### Kriteria Solusi yang Baik\n- Langsung menyerang akar penyebab\n- Feasible (dapat dilaksanakan)\n- Cost-effective\n- Dapat distandarisasi` },
  { id: "langkah-5", title: "Langkah 5: Pelaksanaan Perbaikan", category: "8-steps", icon: "⚙️", color: "#F87171",
    description: "Mengimplementasikan rencana perbaikan sesuai timeline dan memantau progres pelaksanaan.", readTime: 8,
    content: `## Langkah 5 — Pelaksanaan Perbaikan\n\n### Prinsip Implementasi\n1. Ikuti rencana sesuai action plan\n2. Dokumentasikan semua perubahan\n3. Komunikasikan kepada semua pihak terkait\n4. Monitor progres secara berkala\n\n### Hal yang Perlu Dicatat\n- Tanggal dan waktu implementasi\n- Siapa yang melakukan\n- Apa yang diubah/ditambahkan\n- Kondisi sebelum dan sesudah` },
  { id: "langkah-6", title: "Langkah 6: Pemeriksaan Hasil", category: "8-steps", icon: "✅", color: "#34D399",
    description: "Mengevaluasi efektivitas tindakan perbaikan dengan membandingkan data sebelum dan sesudah.", readTime: 10,
    content: `## Langkah 6 — Pemeriksaan Hasil\n\n### Metode Verifikasi\n1. **Before-After Comparison**: Bandingkan data sebelum dan sesudah\n2. **Control Chart**: Amati stabilitas proses\n3. **Target Achievement**: Apakah target tercapai?\n\n### Jika Target Tidak Tercapai\n- Kembali ke Langkah 3 untuk analisis ulang\n- Periksa apakah implementasi sudah benar\n- Cari penyebab lain yang mungkin terlewat` },
  { id: "langkah-7", title: "Langkah 7: Standardisasi", category: "8-steps", icon: "📌", color: "#A78BFA",
    description: "Mendokumentasikan dan menstandarkan perbaikan agar hasil yang dicapai dapat dipertahankan.", readTime: 8,
    content: `## Langkah 7 — Standardisasi\n\n### Dokumen Standarisasi\n- SOP (Standard Operating Procedure) yang diperbarui\n- Work Instruction yang baru\n- Control Plan yang direvisi\n- Training Material untuk operator\n\n### Proses Standardisasi\n1. Tulis ulang SOP/WI sesuai kondisi baru\n2. Sosialisasikan kepada semua operator\n3. Lakukan training/briefing\n4. Tempel visual aid di area kerja` },
  { id: "langkah-8", title: "Langkah 8: Perencanaan Berikutnya", category: "8-steps", icon: "🚀", color: "#F59E0B",
    description: "Merefleksikan pencapaian dan merencanakan tema QCC berikutnya untuk perbaikan berkelanjutan.", readTime: 8,
    content: `## Langkah 8 — Perencanaan Berikutnya\n\n### Review Keseluruhan Proyek\n1. Apa yang berhasil dicapai?\n2. Apa yang bisa dilakukan lebih baik?\n3. Apa pelajaran yang dipetik?\n\n### Identifikasi Tema Berikutnya\n- Gunakan data Pareto dari proyek sebelumnya\n- Masalah yang belum terselesaikan\n- Area dengan potensi perbaikan terbesar\n\n### Siklus PDCA Berlanjut\n**Plan → Do → Check → Act → Plan → ...**\n\nFilosofi kaizen: selalu ada ruang untuk perbaikan!` },
];

export const QUESTIONS: Question[] = [
  { id: 1,  materialId: "check-sheet",   question: "Apa tujuan utama penggunaan Check Sheet dalam QCC?", options: ["Membuat laporan bulanan", "Mengumpulkan dan mengorganisir data secara sistematis", "Membuat diagram alur proses", "Menghitung biaya produksi"], correctIndex: 1, explanation: "Check Sheet dirancang untuk memudahkan pengumpulan dan pencatatan data secara sistematis dan efisien." },
  { id: 2,  materialId: "histogram",     question: "Berapa minimal titik data yang dianjurkan untuk membuat Histogram yang valid?", options: ["10-20 titik data", "20-30 titik data", "50-100 titik data", "200+ titik data"], correctIndex: 2, explanation: "Untuk Histogram yang representatif, dianjurkan mengumpulkan minimal 50-100 titik data." },
  { id: 3,  materialId: "pareto",        question: "Prinsip Pareto menyatakan bahwa sekitar 80% masalah berasal dari berapa persen penyebab?", options: ["10%", "20%", "30%", "50%"], correctIndex: 1, explanation: "Prinsip 80/20 Pareto: 80% masalah berasal dari 20% penyebab." },
  { id: 4,  materialId: "fishbone",      question: "Dalam kategori 4M+1E pada Fishbone Diagram, huruf 'E' merujuk pada apa?", options: ["Equipment", "Engineering", "Environment", "Evaluation"], correctIndex: 2, explanation: "4M+1E terdiri dari Man, Machine, Method, Material, dan Environment (Lingkungan)." },
  { id: 5,  materialId: "control-chart", question: "Apa yang dimaksud dengan UCL dalam Control Chart?", options: ["Upper Cost Limit", "Upper Control Limit", "Unit Control Level", "Uniform Criteria List"], correctIndex: 1, explanation: "UCL = Upper Control Limit (Batas Kendali Atas), yaitu rata-rata + 3 standar deviasi." },
  { id: 6,  materialId: "scatter",       question: "Scatter Diagram digunakan untuk menyelidiki apa?", options: ["Frekuensi kejadian", "Hubungan antara dua variabel", "Distribusi data", "Urutan proses"], correctIndex: 1, explanation: "Scatter Diagram digunakan untuk menyelidiki hubungan/korelasi antara dua variabel yang berbeda." },
  { id: 7,  materialId: "stratifikasi",  question: "Manfaat utama stratifikasi data adalah?", options: ["Mempercepat proses produksi", "Mengungkap perbedaan antar kelompok yang tersembunyi", "Mengurangi jumlah operator", "Menghilangkan kebutuhan check sheet"], correctIndex: 1, explanation: "Stratifikasi membantu mengungkap perbedaan antar subkelompok yang tidak terlihat pada data agregat." },
  { id: 8,  materialId: "langkah-1",     question: "Metode SMART dalam identifikasi masalah, huruf 'M' singkatan dari?", options: ["Manageable", "Measurable", "Meaningful", "Motivating"], correctIndex: 1, explanation: "SMART = Specific, Measurable, Achievable, Relevant, Time-bound. 'M' = Measurable." },
  { id: 9,  materialId: "langkah-3",     question: "Dalam teknik '5 Why', berapa kali minimal pertanyaan 'mengapa' harus ditanyakan?", options: ["2 kali", "3 kali", "5 kali", "10 kali"], correctIndex: 2, explanation: "Teknik 5 Why mengharuskan pertanyaan 'mengapa' ditanyakan minimal 5 kali untuk menemukan akar penyebab." },
  { id: 10, materialId: "langkah-7",     question: "Tujuan utama dari Langkah 7 (Standardisasi) dalam 8 Steps adalah?", options: ["Mencari masalah baru", "Mempertahankan hasil perbaikan agar tidak kembali seperti semula", "Mengurangi biaya produksi", "Meningkatkan kecepatan produksi"], correctIndex: 1, explanation: "Standardisasi bertujuan mengubah perbaikan menjadi standar baku agar hasil yang dicapai dapat dipertahankan." },
  { id: 11, materialId: "histogram",     question: "Histogram dengan bentuk 'bimodal' (dua puncak) mengindikasikan?", options: ["Proses sangat stabil", "Kemungkinan dua proses berbeda bergabung dalam satu dataset", "Data tidak mencukupi", "Proses terlalu cepat"], correctIndex: 1, explanation: "Histogram bimodal menunjukkan kemungkinan adanya dua populasi atau proses berbeda dalam data." },
  { id: 12, materialId: "control-chart", question: "Berapa jumlah titik berturut-turut di satu sisi center line yang mengindikasikan proses out-of-control?", options: ["3 titik", "5 titik", "7 titik", "10 titik"], correctIndex: 2, explanation: "Aturan Western Electric: 7 titik berturut-turut di atas atau di bawah CL mengindikasikan out-of-control." },
  { id: 13, materialId: "langkah-6",     question: "Jika hasil Langkah 6 menunjukkan target tidak tercapai, langkah yang tepat adalah?", options: ["Langsung ke standardisasi", "Kembali ke Langkah 3 untuk analisis ulang", "Menghentikan proyek QCC", "Melaporkan ke manajemen dan berhenti"], correctIndex: 1, explanation: "Jika target tidak tercapai, kembali ke Langkah 3 untuk mencari penyebab lain yang mungkin terlewat." },
  { id: 14, materialId: "pareto",        question: "Diagram Pareto menggabungkan jenis grafik apa?", options: ["Garis dan titik", "Batang dan garis kumulatif", "Lingkaran dan batang", "Radar dan histogram"], correctIndex: 1, explanation: "Diagram Pareto menggabungkan grafik batang (frekuensi) dengan garis kumulatif (persentase)." },
  { id: 15, materialId: "langkah-4",     question: "Framework 5W1H dalam rencana perbaikan, '1H' merujuk pada?", options: ["How Much", "How Many", "How", "How Long"], correctIndex: 2, explanation: "5W1H: What, Why, Where, When, Who, dan How (Bagaimana caranya)." },
  { id: 16, materialId: "fishbone",      question: "Fishbone Diagram disebut juga sebagai?", options: ["Pareto Diagram", "Ishikawa Diagram", "Scatter Diagram", "Control Chart"], correctIndex: 1, explanation: "Fishbone Diagram juga dikenal sebagai Ishikawa Diagram, sesuai nama penciptanya Kaoru Ishikawa." },
  { id: 17, materialId: "stratifikasi",  question: "Berikut yang BUKAN merupakan faktor stratifikasi umum adalah?", options: ["Shift kerja", "Mesin yang digunakan", "Warna seragam operator", "Lokasi/Line produksi"], correctIndex: 2, explanation: "Faktor stratifikasi: mesin, operator/shift, material, waktu, lokasi. Warna seragam bukan faktor relevan." },
  { id: 18, materialId: "check-sheet",   question: "Sebelum implementasi penuh, apa yang sebaiknya dilakukan terhadap Check Sheet?", options: ["Langsung digunakan semua operator", "Uji coba terlebih dahulu", "Minta persetujuan manajemen tertinggi", "Tunggu hasil audit internal"], correctIndex: 1, explanation: "Check sheet sebaiknya diuji coba terlebih dahulu untuk memastikan semua kategori sudah tepat." },
  { id: 19, materialId: "langkah-2",     question: "Istilah 'Gemba Walk' pada Langkah 2 berarti?", options: ["Rapat tim QCC", "Observasi langsung di lapangan/tempat kerja", "Presentasi ke manajemen", "Pengumpulan data dari sistem komputer"], correctIndex: 1, explanation: "'Gemba' = tempat sesungguhnya. Gemba Walk = observasi langsung di lapangan." },
  { id: 20, materialId: "langkah-8",     question: "Siklus perbaikan berkelanjutan dalam QCC mengikuti pola?", options: ["DMAIC", "PDCA", "SIPOC", "FMEA"], correctIndex: 1, explanation: "QCC mengikuti siklus PDCA (Plan-Do-Check-Act) untuk continuous improvement." },
  { id: 21, materialId: "scatter",       question: "Berapa pasang data minimal yang dianjurkan untuk Scatter Diagram yang valid?", options: ["10 pasang", "20 pasang", "30 pasang", "50 pasang"], correctIndex: 2, explanation: "Scatter Diagram yang valid memerlukan minimal 30 pasang data untuk analisis korelasi yang representatif." },
  { id: 22, materialId: "langkah-5",     question: "Dalam Langkah 5, apa yang WAJIB didokumentasikan?", options: ["Hanya waktu mulai dan selesai", "Semua perubahan beserta kondisi sebelum dan sesudah", "Nama operator yang terlibat saja", "Biaya implementasi saja"], correctIndex: 1, explanation: "Dokumentasi harus mencakup tanggal, pelaksana, apa yang diubah, serta kondisi sebelum dan sesudah perbaikan." },
  { id: 23, materialId: "histogram",     question: "Histogram yang berbentuk 'skew kanan' menunjukkan?", options: ["Banyak nilai tinggi, sedikit nilai rendah", "Banyak nilai rendah, sedikit nilai tinggi", "Distribusi normal sempurna", "Data tidak valid"], correctIndex: 1, explanation: "Skew kanan = ekor panjang ke kanan = banyak nilai rendah di kiri, sedikit nilai tinggi di kanan." },
  { id: 24, materialId: "control-chart", question: "Apa kepanjangan dari LCL dalam Control Chart?", options: ["Lowest Critical Level", "Lower Control Limit", "Limit Control Level", "Line Control Limit"], correctIndex: 1, explanation: "LCL = Lower Control Limit (Batas Kendali Bawah) = rata-rata dikurangi 3 standar deviasi." },
  { id: 25, materialId: "pareto",        question: "Kapan Diagram Pareto TIDAK cocok digunakan?", options: ["Memilih masalah prioritas", "Menganalisis distribusi data berkelanjutan", "Menganalisis penyebab reject produk", "Mengevaluasi efektivitas perbaikan"], correctIndex: 1, explanation: "Diagram Pareto tidak cocok untuk distribusi data berkelanjutan — gunakan Histogram untuk itu." },
];

export const MY_ATTEMPTS: QuizAttempt[] = [
  { id: 1,  noreg: "1234567", attemptNumber: 1,  correctAnswers: 10, wrongAnswers: 15, pointsEarned: 50,  createdAt: "2026-05-01", topic: "Seven Tools" },
  { id: 2,  noreg: "1234567", attemptNumber: 2,  correctAnswers: 14, wrongAnswers: 11, pointsEarned: 70,  createdAt: "2026-05-03", topic: "Seven Tools" },
  { id: 3,  noreg: "1234567", attemptNumber: 3,  correctAnswers: 13, wrongAnswers: 12, pointsEarned: 65,  createdAt: "2026-05-06", topic: "8 Steps" },
  { id: 4,  noreg: "1234567", attemptNumber: 4,  correctAnswers: 17, wrongAnswers: 8,  pointsEarned: 85,  createdAt: "2026-05-09", topic: "Seven Tools" },
  { id: 5,  noreg: "1234567", attemptNumber: 5,  correctAnswers: 16, wrongAnswers: 9,  pointsEarned: 80,  createdAt: "2026-05-12", topic: "8 Steps" },
  { id: 6,  noreg: "1234567", attemptNumber: 6,  correctAnswers: 19, wrongAnswers: 6,  pointsEarned: 95,  createdAt: "2026-05-15", topic: "Seven Tools" },
  { id: 7,  noreg: "1234567", attemptNumber: 7,  correctAnswers: 18, wrongAnswers: 7,  pointsEarned: 90,  createdAt: "2026-05-18", topic: "8 Steps" },
  { id: 8,  noreg: "1234567", attemptNumber: 8,  correctAnswers: 20, wrongAnswers: 5,  pointsEarned: 100, createdAt: "2026-05-21", topic: "Seven Tools" },
  { id: 9,  noreg: "1234567", attemptNumber: 9,  correctAnswers: 21, wrongAnswers: 4,  pointsEarned: 105, createdAt: "2026-05-25", topic: "8 Steps" },
  { id: 10, noreg: "1234567", attemptNumber: 10, correctAnswers: 19, wrongAnswers: 6,  pointsEarned: 95,  createdAt: "2026-05-28", topic: "Seven Tools" },
  { id: 11, noreg: "1234567", attemptNumber: 11, correctAnswers: 22, wrongAnswers: 3,  pointsEarned: 110, createdAt: "2026-06-01", topic: "8 Steps" },
  { id: 12, noreg: "1234567", attemptNumber: 12, correctAnswers: 20, wrongAnswers: 5,  pointsEarned: 100, createdAt: "2026-06-04", topic: "Seven Tools" },
  { id: 13, noreg: "1234567", attemptNumber: 13, correctAnswers: 23, wrongAnswers: 2,  pointsEarned: 115, createdAt: "2026-06-08", topic: "8 Steps" },
  { id: 14, noreg: "1234567", attemptNumber: 14, correctAnswers: 23, wrongAnswers: 2,  pointsEarned: 115, createdAt: "2026-06-11", topic: "Seven Tools" },
];

export const WRONG_ANSWER_STATS = [
  { topic: "Scatter Diagram",       wrongCount: 87, totalAttempts: 120, pct: 72 },
  { topic: "Control Chart UCL/LCL", wrongCount: 74, totalAttempts: 120, pct: 61 },
  { topic: "Stratifikasi Data",     wrongCount: 62, totalAttempts: 120, pct: 51 },
  { topic: "5 Why Analysis",        wrongCount: 55, totalAttempts: 120, pct: 45 },
  { topic: "Histogram Bimodal",     wrongCount: 48, totalAttempts: 120, pct: 40 },
  { topic: "Langkah 6 Evaluasi",    wrongCount: 41, totalAttempts: 120, pct: 34 },
  { topic: "Prinsip Pareto 80/20",  wrongCount: 33, totalAttempts: 120, pct: 27 },
];

export const LINES = ["Semua Line", "MELTING", "CORE MAKING", "MOULDING", "FINISHING", "DIE PRESS", "MAINTENANCE", "ENGINEERING"];
export const SHIFTS = ["Semua Shift", "RED", "WHITE"];
export const DIVISIONS = SHIFTS;

export function getLevel(points: number) {
  if (points < 200)  return { level: 1, label: "Pelajar",    min: 0,    max: 200  };
  if (points < 400)  return { level: 2, label: "Pemula",     min: 200,  max: 400  };
  if (points < 700)  return { level: 3, label: "Terampil",   min: 400,  max: 700  };
  if (points < 1000) return { level: 4, label: "Mahir",      min: 700,  max: 1000 };
  if (points < 1400) return { level: 5, label: "Ahli",       min: 1000, max: 1400 };
  return               { level: 6, label: "Pakar QCC", min: 1400, max: 2000 };
}
