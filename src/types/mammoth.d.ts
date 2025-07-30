declare module "mammoth" {
  interface ExtractResult {
    value: string;
    messages: unknown[];
  }
  export function extractRawText(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<ExtractResult>;
}
