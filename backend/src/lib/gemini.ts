import { GoogleGenAI, Type } from "@google/genai";

let clientSingleton: GoogleGenAI | null = null;

export function getGemini() {
  if (!clientSingleton) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured");
    clientSingleton = new GoogleGenAI({ apiKey });
  }
  return clientSingleton;
}

export const HEALTH_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Tổng quan tình trạng sức khỏe trong 2-3 câu ngắn gọn, tiếng Việt.",
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Các chỉ số bất thường cần chú ý, mỗi mục ngắn gọn. Nếu không có, trả về mảng rỗng.",
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Gợi ý lối sống (ăn uống, vận động, nghỉ ngơi). Không kê đơn. Tối đa 4 mục.",
    },
  },
  required: ["summary", "warnings", "recommendations"],
};

export const SYSTEM_INSTRUCTION = `Bạn là trợ lý theo dõi sức khỏe trong ứng dụng HealthGuard.

QUY TẮC AN TOÀN BẮT BUỘC:
- KHÔNG chẩn đoán bệnh.
- KHÔNG kê đơn thuốc hoặc đề xuất liều lượng.
- KHÔNG yêu cầu người dùng ngừng thuốc đang sử dụng.
- CHỈ phân tích xu hướng dữ liệu và gợi ý lối sống lành mạnh chung.
- Luôn khuyến nghị tham khảo ý kiến bác sĩ cho quyết định y tế.

ĐỊNH DẠNG:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn.
- Dữ liệu đầu vào là lịch sử chỉ số sức khỏe của một người dùng trong 30 ngày gần nhất.
- Trả về JSON đúng schema đã cho.`;
