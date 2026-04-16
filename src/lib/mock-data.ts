// === PROFILE ===
export const mockProfile = {
  id: "user-001",
  fullName: "Nguyễn Văn Minh",
  dateOfBirth: "1990-03-15",
  gender: "male",
  bloodType: "O+",
  insuranceNumber: "DN4051234567",
  phone: "0901234567",
  avatarUrl: null, // dùng avatar initials "NM"
};

// === EMERGENCY ===
export const mockAllergies = [
  { id: "a1", name: "Penicillin", severity: "severe" },
  { id: "a2", name: "Tôm", severity: "moderate" },
  { id: "a3", name: "Phấn hoa", severity: "mild" },
];

export const mockConditions = [
  {
    id: "c1",
    name: "Tiểu đường type 2",
    diagnosedDate: "2020-06-15",
    isActive: true,
  },
  {
    id: "c2",
    name: "Huyết áp cao",
    diagnosedDate: "2019-11-20",
    isActive: true,
  },
];

export const mockEmergencyContacts = [
  {
    id: "ec1",
    name: "Nguyễn Thị Lan",
    relationship: "Vợ",
    phone: "0912345678",
    isPrimary: true,
  },
  {
    id: "ec2",
    name: "Nguyễn Văn Hùng",
    relationship: "Anh trai",
    phone: "0923456789",
    isPrimary: false,
  },
];

// === MEDICATIONS ===
export const mockMedications = [
  {
    id: "med1",
    name: "Metformin",
    dosage: "500",
    unit: "mg",
    frequency: "2 lần/ngày",
    timesPerDay: ["07:30", "12:00"],
    instructions: "Sau ăn",
    startDate: "2024-01-01",
    endDate: null,
    isActive: true,
    imageUrl: null,
  },
  {
    id: "med2",
    name: "Amlodipine",
    dosage: "5",
    unit: "mg",
    frequency: "1 lần/ngày",
    timesPerDay: ["20:00"],
    instructions: "Trước khi ngủ",
    startDate: "2024-01-01",
    endDate: null,
    isActive: true,
    imageUrl: null,
  },
  {
    id: "med3",
    name: "Vitamin D3",
    dosage: "1000",
    unit: "IU",
    frequency: "1 lần/ngày",
    timesPerDay: ["07:30"],
    instructions: "Sau ăn sáng",
    startDate: "2024-06-01",
    endDate: null,
    isActive: true,
    imageUrl: null,
  },
];

export const mockMedLogs = [
  {
    id: "log1",
    medicationId: "med1",
    scheduledTime: "2026-04-12T07:30",
    takenTime: "2026-04-12T07:35",
    status: "taken",
  },
  {
    id: "log2",
    medicationId: "med3",
    scheduledTime: "2026-04-12T07:30",
    takenTime: "2026-04-12T07:35",
    status: "taken",
  },
  {
    id: "log3",
    medicationId: "med1",
    scheduledTime: "2026-04-12T12:00",
    takenTime: null,
    status: "pending",
  },
  {
    id: "log4",
    medicationId: "med2",
    scheduledTime: "2026-04-12T20:00",
    takenTime: null,
    status: "pending",
  },
];

export const mockCabinet = [
  {
    id: "cab1",
    name: "Metformin 500mg",
    quantityTotal: 60,
    quantityRemaining: 45,
    expiryDate: "2026-12-01",
    lowStockThreshold: 10,
  },
  {
    id: "cab2",
    name: "Amlodipine 5mg",
    quantityTotal: 30,
    quantityRemaining: 8,
    expiryDate: "2026-08-15",
    lowStockThreshold: 10,
  },
  {
    id: "cab3",
    name: "Vitamin D3 1000IU",
    quantityTotal: 90,
    quantityRemaining: 72,
    expiryDate: "2027-03-01",
    lowStockThreshold: 15,
  },
  {
    id: "cab4",
    name: "Paracetamol 500mg",
    quantityTotal: 20,
    quantityRemaining: 3,
    expiryDate: "2025-12-01",
    lowStockThreshold: 5,
  },
  {
    id: "cab5",
    name: "Omeprazole 20mg",
    quantityTotal: 30,
    quantityRemaining: 0,
    expiryDate: "2026-06-01",
    lowStockThreshold: 5,
  },
];

// === APPOINTMENTS ===
export const mockAppointments = [
  {
    id: "apt1",
    title: "Tái khám Tim mạch",
    doctorName: "BS. Trần Văn Bình",
    hospital: "BV Đại học Y Dược",
    appointmentDate: "2026-04-15T09:00",
    notes: "Mang theo kết quả xét nghiệm máu",
    status: "upcoming",
  },
  {
    id: "apt2",
    title: "Khám Nội tiết",
    doctorName: "BS. Lê Thị Mai",
    hospital: "BV Chợ Rẫy",
    appointmentDate: "2026-04-22T14:00",
    notes: "Nhịn ăn trước 8 tiếng",
    status: "upcoming",
  },
  {
    id: "apt3",
    title: "Khám mắt định kỳ",
    doctorName: "BS. Phạm Quốc Anh",
    hospital: "BV Mắt TP.HCM",
    appointmentDate: "2026-03-20T10:00",
    notes: "",
    status: "completed",
  },
];

// === CHILDREN ===
export const mockChildren = [
  {
    id: "child1",
    name: "Bé An",
    dateOfBirth: "2024-10-01",
    gender: "male",
    avatarUrl: null,
  },
  {
    id: "child2",
    name: "Bé Bình",
    dateOfBirth: "2022-05-15",
    gender: "female",
    avatarUrl: null,
  },
];

// === VACCINATIONS (Lịch TCMR chuẩn Bộ Y tế Việt Nam) ===
export const mockVaccinations = [
  // Sơ sinh
  {
    id: "v1",
    childId: "child1",
    vaccineName: "BCG (Lao)",
    doseNumber: 1,
    scheduledDate: "2024-10-01",
    actualDate: "2024-10-01",
    status: "completed",
    ageGroup: "Sơ sinh",
  },
  {
    id: "v2",
    childId: "child1",
    vaccineName: "Viêm gan B",
    doseNumber: 0,
    scheduledDate: "2024-10-01",
    actualDate: "2024-10-01",
    status: "completed",
    ageGroup: "Sơ sinh",
  },
  // 2 tháng
  {
    id: "v3",
    childId: "child1",
    vaccineName: "DPT-VGB-Hib",
    doseNumber: 1,
    scheduledDate: "2024-12-01",
    actualDate: "2024-12-03",
    status: "completed",
    ageGroup: "2 tháng",
  },
  {
    id: "v4",
    childId: "child1",
    vaccineName: "OPV",
    doseNumber: 1,
    scheduledDate: "2024-12-01",
    actualDate: "2024-12-03",
    status: "completed",
    ageGroup: "2 tháng",
  },
  // 3 tháng
  {
    id: "v5",
    childId: "child1",
    vaccineName: "DPT-VGB-Hib",
    doseNumber: 2,
    scheduledDate: "2025-01-01",
    actualDate: "2025-01-05",
    status: "completed",
    ageGroup: "3 tháng",
  },
  {
    id: "v6",
    childId: "child1",
    vaccineName: "OPV",
    doseNumber: 2,
    scheduledDate: "2025-01-01",
    actualDate: null,
    status: "overdue",
    ageGroup: "3 tháng",
  },
  // 4 tháng
  {
    id: "v7",
    childId: "child1",
    vaccineName: "DPT-VGB-Hib",
    doseNumber: 3,
    scheduledDate: "2025-02-01",
    actualDate: "2025-02-04",
    status: "completed",
    ageGroup: "4 tháng",
  },
  {
    id: "v8",
    childId: "child1",
    vaccineName: "OPV",
    doseNumber: 3,
    scheduledDate: "2025-02-01",
    actualDate: "2025-02-04",
    status: "completed",
    ageGroup: "4 tháng",
  },
  // 9 tháng
  {
    id: "v9",
    childId: "child1",
    vaccineName: "Sởi",
    doseNumber: 1,
    scheduledDate: "2025-07-01",
    actualDate: null,
    status: "pending",
    ageGroup: "9 tháng",
  },
  {
    id: "v10",
    childId: "child1",
    vaccineName: "Viêm não Nhật Bản",
    doseNumber: 1,
    scheduledDate: "2025-07-01",
    actualDate: null,
    status: "pending",
    ageGroup: "9 tháng",
  },
  // 12 tháng
  {
    id: "v11",
    childId: "child1",
    vaccineName: "Viêm não Nhật Bản",
    doseNumber: 2,
    scheduledDate: "2025-10-01",
    actualDate: null,
    status: "pending",
    ageGroup: "12 tháng",
  },
  // 18 tháng
  {
    id: "v12",
    childId: "child1",
    vaccineName: "DPT",
    doseNumber: 4,
    scheduledDate: "2026-04-01",
    actualDate: null,
    status: "pending",
    ageGroup: "18 tháng",
  },
  {
    id: "v13",
    childId: "child1",
    vaccineName: "Sởi - Rubella",
    doseNumber: 1,
    scheduledDate: "2026-04-01",
    actualDate: null,
    status: "pending",
    ageGroup: "18 tháng",
  },
];

// === CHILD HEALTH LOGS ===
export const mockChildHealthLogs = [
  {
    id: "chl1",
    childId: "child1",
    logDate: "2026-04-12",
    weightKg: 10.5,
    heightCm: 78,
    temperature: 37.8,
    notes: "Sốt nhẹ sau tiêm, cho uống hạ sốt",
    tags: ["sốt", "theo-dõi"],
  },
  {
    id: "chl2",
    childId: "child1",
    logDate: "2026-04-10",
    weightKg: 10.5,
    heightCm: 78,
    temperature: 36.5,
    notes: "Cân đo định kỳ, phát triển tốt theo chuẩn WHO",
    tags: ["khám-định-kỳ"],
  },
  {
    id: "chl3",
    childId: "child1",
    logDate: "2026-03-28",
    weightKg: 10.3,
    heightCm: 77.5,
    temperature: 36.6,
    notes: "Bé ăn tốt, ngủ đủ giấc",
    tags: ["khám-định-kỳ"],
  },
  {
    id: "chl4",
    childId: "child1",
    logDate: "2026-03-15",
    weightKg: null,
    heightCm: null,
    temperature: 38.5,
    notes: "Sốt cao, đi khám tại BV Nhi Đồng 1. Chẩn đoán: viêm họng",
    tags: ["sốt", "khám-bệnh"],
  },
];

// === HEALTH METRICS (30 ngày gần nhất) ===
export const mockHealthMetrics = {
  bloodPressure: [
    { date: "2026-04-06", systolic: 118, diastolic: 78 },
    { date: "2026-04-07", systolic: 122, diastolic: 80 },
    { date: "2026-04-08", systolic: 125, diastolic: 82 },
    { date: "2026-04-09", systolic: 120, diastolic: 79 },
    { date: "2026-04-10", systolic: 130, diastolic: 85 },
    { date: "2026-04-11", systolic: 124, diastolic: 81 },
    { date: "2026-04-12", systolic: 121, diastolic: 80 },
  ],
  bloodSugar: [
    { date: "2026-04-06", value: 5.2 },
    { date: "2026-04-07", value: 5.4 },
    { date: "2026-04-08", value: 5.6 },
    { date: "2026-04-09", value: 5.3 },
    { date: "2026-04-10", value: 5.8 },
    { date: "2026-04-11", value: 5.5 },
    { date: "2026-04-12", value: 5.6 },
  ],
  heartRate: [
    { date: "2026-04-06", value: 75 },
    { date: "2026-04-07", value: 72 },
    { date: "2026-04-08", value: 78 },
    { date: "2026-04-09", value: 70 },
    { date: "2026-04-10", value: 74 },
    { date: "2026-04-11", value: 71 },
    { date: "2026-04-12", value: 72 },
  ],
  weight: [
    { date: "2026-03-12", value: 72.5 },
    { date: "2026-03-19", value: 72.3 },
    { date: "2026-03-26", value: 72.0 },
    { date: "2026-04-02", value: 71.8 },
    { date: "2026-04-09", value: 71.5 },
    { date: "2026-04-12", value: 71.3 },
  ],
};

export const mockAIInsight = {
  summary:
    "Huyết áp của bạn ổn định trong 7 ngày qua, trung bình 122/80 mmHg — nằm trong ngưỡng bình thường. Chỉ số đường huyết có xu hướng tăng nhẹ (+0.3 mmol/L so với tuần trước), cần theo dõi thêm.",
  warnings: ["Đường huyết tăng nhẹ, cần kiểm tra lại sau 1 tuần"],
  recommendations: [
    "Tiếp tục duy trì chế độ uống thuốc đều đặn",
    "Hạn chế đồ ngọt và tinh bột trong tuần tới",
    "Nên đi bộ 30 phút mỗi ngày",
  ],
  disclaimer:
    "Đây là phân tích tham khảo từ AI, không thay thế tư vấn y khoa chuyên nghiệp. Hãy tham khảo ý kiến bác sĩ để được tư vấn chính xác.",
  updatedAt: "2026-04-12T08:00:00",
};

// === NOTIFICATIONS ===
export const mockNotifications = [
  {
    id: "n1",
    type: "medication",
    title: "Đến giờ uống thuốc",
    body: "Metformin 500mg — Sau ăn trưa",
    scheduledAt: "2026-04-12T12:00",
    isRead: false,
  },
  {
    id: "n2",
    type: "appointment",
    title: "Nhắc lịch tái khám",
    body: "Tái khám Tim mạch — 15/04 lúc 09:00",
    scheduledAt: "2026-04-14T09:00",
    isRead: false,
  },
  {
    id: "n3",
    type: "vaccination",
    title: "Lịch tiêm chủng sắp đến",
    body: "Bé An — DPT mũi 4 (18 tháng)",
    scheduledAt: "2026-04-01T08:00",
    isRead: true,
  },
  {
    id: "n4",
    type: "metric_alert",
    title: "Cảnh báo chỉ số",
    body: "Đường huyết vượt ngưỡng cảnh báo: 5.8 mmol/L",
    scheduledAt: "2026-04-10T07:00",
    isRead: true,
  },
];
