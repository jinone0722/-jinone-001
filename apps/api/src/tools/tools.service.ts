import { Injectable } from "@nestjs/common";

const TOOLS = [
  { key: "image-convert", name: "图片格式转换", status: "placeholder" },
  { key: "image-compress", name: "图片压缩", status: "placeholder" },
  { key: "image-ocr", name: "图片转文字", status: "placeholder" },
  { key: "pdf-to-word", name: "PDF 转 Word", status: "placeholder" },
  { key: "word-to-pdf", name: "Word 转 PDF", status: "placeholder" },
  { key: "excel-to-csv", name: "Excel 转 CSV", status: "placeholder" },
  { key: "csv-to-excel", name: "CSV 转 Excel", status: "placeholder" }
];

@Injectable()
export class ToolsService {
  list() {
    return TOOLS;
  }

  run(toolKey: string) {
    const tool = TOOLS.find((item) => item.key === toolKey);
    return {
      toolKey,
      name: tool?.name ?? toolKey,
      status: "queued",
      message: "MVP placeholder: 工具任务接口已预留，后续可接入真实转换服务。"
    };
  }
}
