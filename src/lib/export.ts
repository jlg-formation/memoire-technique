import type { Project } from "../types/project";
import { stripPdfFields } from "./sanitize";

export function exportProjectJSON(project: Project): string {
  return JSON.stringify(stripPdfFields(project), null, 2);
}

export function importProjectJSON(json: string): Project {
  return stripPdfFields(JSON.parse(json) as Project);
}

function crc32(data: Uint8Array): number {
  let crc = -1;
  for (const byte of data) {
    let c = (crc ^ byte) & 0xff;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crc = (crc >>> 8) ^ c;
  }
  return (~crc >>> 0) >>> 0;
}

export async function exportProjectZIP(project: Project): Promise<Blob> {
  const encoder = new TextEncoder();
  const filename = "project.json";
  const filenameBytes = encoder.encode(filename);
  const data = encoder.encode(exportProjectJSON(project));
  const header = new Uint8Array(30 + filenameBytes.length);
  const headerView = new DataView(header.buffer);
  headerView.setUint32(0, 0x04034b50, true);
  headerView.setUint16(4, 20, true);
  headerView.setUint16(6, 0, true);
  headerView.setUint16(8, 0, true);
  headerView.setUint16(10, 0, true);
  headerView.setUint16(12, 0, true);
  const crc = crc32(data);
  headerView.setUint32(14, crc, true);
  headerView.setUint32(18, data.length, true);
  headerView.setUint32(22, data.length, true);
  headerView.setUint16(26, filenameBytes.length, true);
  headerView.setUint16(28, 0, true);
  header.set(filenameBytes, 30);

  const central = new Uint8Array(46 + filenameBytes.length);
  const centralView = new DataView(central.buffer);
  centralView.setUint32(0, 0x02014b50, true);
  centralView.setUint16(4, 20, true);
  centralView.setUint16(6, 20, true);
  centralView.setUint16(8, 0, true);
  centralView.setUint16(10, 0, true);
  centralView.setUint16(12, 0, true);
  centralView.setUint16(14, 0, true);
  centralView.setUint32(16, crc, true);
  centralView.setUint32(20, data.length, true);
  centralView.setUint32(24, data.length, true);
  centralView.setUint16(28, filenameBytes.length, true);
  centralView.setUint16(30, 0, true);
  centralView.setUint16(32, 0, true);
  centralView.setUint16(34, 0, true);
  centralView.setUint16(36, 0, true);
  centralView.setUint32(38, 0, true);
  centralView.setUint32(42, 0, true);
  central.set(filenameBytes, 46);

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, 1, true);
  endView.setUint16(10, 1, true);
  endView.setUint32(12, central.length, true);
  endView.setUint32(16, header.length + data.length, true);
  endView.setUint16(20, 0, true);

  const zip = new Uint8Array(
    header.length + data.length + central.length + end.length,
  );
  zip.set(header, 0);
  zip.set(data, header.length);
  zip.set(central, header.length + data.length);
  zip.set(end, header.length + data.length + central.length);

  return new Blob([zip], { type: "application/zip" });
}

export async function importProjectZIP(blob: Blob): Promise<Project> {
  const buffer = await blob.arrayBuffer();
  const view = new DataView(buffer);
  const nameLength = view.getUint16(26, true);
  const extraLength = view.getUint16(28, true);
  const dataLength = view.getUint32(22, true);
  const offset = 30 + nameLength + extraLength;
  const data = new Uint8Array(buffer, offset, dataLength);
  const decoder = new TextDecoder();
  const json = decoder.decode(data);
  return importProjectJSON(json);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
