export type TcmrItem = {
  vaccineCode: string;
  vaccineName: string;
  doseNumber: number;
  ageMonths: number;
  ageGroup: string;
};

export const TCMR_SCHEDULE: TcmrItem[] = [
  { vaccineCode: "BCG", vaccineName: "BCG (Lao)", doseNumber: 1, ageMonths: 0, ageGroup: "Sơ sinh" },
  { vaccineCode: "HEPB_0", vaccineName: "Viêm gan B (HepB)", doseNumber: 1, ageMonths: 0, ageGroup: "Sơ sinh" },
  { vaccineCode: "DPT_VGB_HIB_1", vaccineName: "DPT-VGB-Hib", doseNumber: 1, ageMonths: 2, ageGroup: "2 tháng" },
  { vaccineCode: "OPV_1", vaccineName: "Bại liệt (OPV)", doseNumber: 1, ageMonths: 2, ageGroup: "2 tháng" },
  { vaccineCode: "DPT_VGB_HIB_2", vaccineName: "DPT-VGB-Hib", doseNumber: 2, ageMonths: 3, ageGroup: "3 tháng" },
  { vaccineCode: "OPV_2", vaccineName: "Bại liệt (OPV)", doseNumber: 2, ageMonths: 3, ageGroup: "3 tháng" },
  { vaccineCode: "DPT_VGB_HIB_3", vaccineName: "DPT-VGB-Hib", doseNumber: 3, ageMonths: 4, ageGroup: "4 tháng" },
  { vaccineCode: "OPV_3", vaccineName: "Bại liệt (OPV)", doseNumber: 3, ageMonths: 4, ageGroup: "4 tháng" },
  { vaccineCode: "MEASLES_1", vaccineName: "Sởi", doseNumber: 1, ageMonths: 9, ageGroup: "9 tháng" },
  { vaccineCode: "JE_1", vaccineName: "Viêm não Nhật Bản", doseNumber: 1, ageMonths: 12, ageGroup: "12 tháng" },
  { vaccineCode: "JE_2", vaccineName: "Viêm não Nhật Bản", doseNumber: 2, ageMonths: 13, ageGroup: "13 tháng" },
  { vaccineCode: "MR_1", vaccineName: "Sởi-Rubella (MR)", doseNumber: 1, ageMonths: 18, ageGroup: "18 tháng" },
  { vaccineCode: "DPT_4", vaccineName: "Bạch hầu-Ho gà-Uốn ván (DPT)", doseNumber: 4, ageMonths: 18, ageGroup: "18 tháng" },
  { vaccineCode: "JE_3", vaccineName: "Viêm não Nhật Bản", doseNumber: 3, ageMonths: 24, ageGroup: "24 tháng" },
];

export function scheduledDateFromDob(dob: Date, ageMonths: number): Date {
  const d = new Date(dob);
  d.setMonth(d.getMonth() + ageMonths);
  return d;
}
