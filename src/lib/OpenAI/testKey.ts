import createClient from "./client";

export default async function testKey(apiKey: string): Promise<boolean> {
  const openai = createClient(apiKey);
  try {
    await openai.models.list();
    return true;
  } catch {
    return false;
  }
}
