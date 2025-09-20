let mammoth: typeof import("mammoth") | undefined;

async function loadMammoth() {
  if (!mammoth) {
    mammoth = (await import(
      /* @vite-ignore */ "mammoth"
    )) as typeof import("mammoth");
  }
  if (!mammoth) {
    throw new Error("Cannot load mammoth");
  }
  return mammoth;
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await loadMammoth();
  const buffer = await file.arrayBuffer();

  try {
    const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
    return value.trim();
  } catch (err) {
    console.warn("mammoth.js not available, falling back", err);
  }

  const xmlData = await readFileFromZip(buffer, "word/document.xml");
  if (!xmlData) {
    console.warn("word/document.xml not found in docx", file.name);
    return "";
  }

  const xml = new TextDecoder().decode(xmlData);
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const texts = Array.from(doc.getElementsByTagName("w:t"))
    .map((n) => n.textContent || "")
    .join(" ");

  return texts.replace(/\s+/g, " ").trim();
}

async function readFileFromZip(
  buffer: ArrayBuffer,
  filename: string,
): Promise<Uint8Array | null> {
  const view = new DataView(buffer);
  const decoder = new TextDecoder();
  let offset = 0;

  while (offset + 30 <= buffer.byteLength) {
    if (view.getUint32(offset, true) !== 0x04034b50) {
      break;
    }
    const compression = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const name = decoder.decode(
      new Uint8Array(buffer, offset + 30, nameLength),
    );
    const dataStart = offset + 30 + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    const compressed = new Uint8Array(buffer.slice(dataStart, dataEnd));
    offset = dataEnd;

    if (name === filename) {
      if (compression === 0) {
        return compressed;
      }
      if (compression === 8) {
        return inflate(compressed);
      }
      throw new Error(`Unsupported compression method: ${compression}`);
    }
  }
  return null;
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  // Utilise DecompressionStream pour décompresser les données deflate
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  // Copie dans un ArrayBuffer standard si besoin
  let arrayBuffer: ArrayBuffer;
  if (
    data.buffer instanceof ArrayBuffer &&
    !(data.buffer instanceof SharedArrayBuffer)
  ) {
    arrayBuffer = data.buffer;
  } else {
    arrayBuffer = new Uint8Array(data).buffer;
  }
  await writer.write(arrayBuffer);
  await writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
    }
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
