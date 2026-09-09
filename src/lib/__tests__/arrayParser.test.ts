import { describe, it, expect } from "vitest";
import {
  cleanItemString,
  parseSmartArray,
  serializeSmartArray,
  parseSmartObject,
  serializeSmartObject,
} from "../arrayParser";

describe("arrayParser", () => {
  describe("cleanItemString", () => {
    it("cleans quotes, semicolons, and bullets", () => {
      expect(cleanItemString('"Проживание";')).toBe("Проживание");
      expect(cleanItemString("'Питание'")).toBe("Питание");
      expect(cleanItemString("• 3 тренировки в день")).toBe("3 тренировки в день");
      expect(cleanItemString("- Видеоразбор;")).toBe("Видеоразбор");
      expect(cleanItemString("1. Трансфер")).toBe("Трансфер");
      expect(cleanItemString("2) Ски-пасс")).toBe("Ски-пасс");
      expect(cleanItemString("(3) Страховка")).toBe("Страховка");
      expect(cleanItemString("* Экскурсии")).toBe("Экскурсии");
      expect(cleanItemString("«Безопасные трассы»")).toBe("Безопасные трассы");
    });
  });

  describe("parseSmartArray", () => {
    it("parses user's screenshot format with quotes and semicolons", () => {
      const input = '"Проживание"; "Питание"; "3 тренировки в день"; "Видео разбор"; "Развлекательная программа";';
      const result = parseSmartArray(input);
      expect(result).toEqual([
        "Проживание",
        "Питание",
        "3 тренировки в день",
        "Видео разбор",
        "Развлекательная программа",
      ]);
    });

    it("parses bullet-point lists with newlines and semicolons", () => {
      const input = `- Проживание;\n- 3-х разовое питание;\n• 3 тренировки в день;\n* Видеоразбор;`;
      expect(parseSmartArray(input)).toEqual([
        "Проживание",
        "3-х разовое питание",
        "3 тренировки в день",
        "Видеоразбор",
      ]);
    });

    it("parses numbered lists", () => {
      const input = `1. Первое занятие\n2. Второе занятие\n3. Соревнования`;
      expect(parseSmartArray(input)).toEqual([
        "Первое занятие",
        "Второе занятие",
        "Соревнования",
      ]);
    });

    it("parses valid JSON array strings", () => {
      const input = '["Проживание", "Питание", "Страховка"]';
      expect(parseSmartArray(input)).toEqual(["Проживание", "Питание", "Страховка"]);
    });

    it("handles already parsed arrays", () => {
      const input = ["• Проживание;", "Питание"];
      expect(parseSmartArray(input)).toEqual(["Проживание", "Питание"]);
    });

    it("parses multiline text", () => {
      const input = `Проживание\nПитание\n3 тренировки в день`;
      expect(parseSmartArray(input)).toEqual(["Проживание", "Питание", "3 тренировки в день"]);
    });

    it("parses comma-separated values", () => {
      const input = "Проживание, Питание, Трансфер";
      expect(parseSmartArray(input)).toEqual(["Проживание", "Питание", "Трансфер"]);
    });

    it("returns empty array for empty inputs", () => {
      expect(parseSmartArray("")).toEqual([]);
      expect(parseSmartArray(null)).toEqual([]);
      expect(parseSmartArray(undefined)).toEqual([]);
      expect(parseSmartArray(123 as any)).toEqual([]);
    });
  });

  describe("serializeSmartArray", () => {
    it("serializes clean array to JSON string", () => {
      const items = ['"Проживание";', " Питание "];
      expect(serializeSmartArray(items)).toBe('["Проживание","Питание"]');
    });

    it("safely handles non-array input", () => {
      expect(serializeSmartArray(null as any)).toBe("[]");
    });
  });

  describe("parseSmartObject & serializeSmartObject", () => {
    it("parses valid JSON object", () => {
      const input = '{"camps_count": "5", "participants": "80+"}';
      expect(parseSmartObject(input)).toEqual({
        camps_count: "5",
        participants: "80+",
      });
    });

    it("parses line-by-line key: value pairs", () => {
      const input = `camps_count: 5\nparticipants: 80+`;
      expect(parseSmartObject(input)).toEqual({
        camps_count: "5",
        participants: "80+",
      });
    });

    it("parses semicolon-separated key: value pairs", () => {
      const input = `"camps_count": 5; "participants": "80+"`;
      expect(parseSmartObject(input)).toEqual({
        camps_count: "5",
        participants: "80+",
      });
    });

    it("serializes object to valid JSON string", () => {
      const obj = { camps_count: " 5 ", participants: "80+" };
      expect(serializeSmartObject(obj)).toBe('{"camps_count":"5","participants":"80+"}');
    });

    it("safely handles non-object input in serializeSmartObject", () => {
      expect(serializeSmartObject(null as any)).toBe("{}");
      expect(serializeSmartObject([] as any)).toBe("{}");
    });
  });
});
