export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("file read error"));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result.split(",", 2)[1]);
      else reject(new Error("invalid result"));
    };
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(
  base64: string,
  filename: string,
  type: string,
): File {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type });
}
