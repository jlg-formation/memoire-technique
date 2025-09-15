import createClient from "./client";

export default async function testKey(): Promise<boolean> {
  const openai = createClient();
  try {
    await openai.models.list();
    return true;
  } catch {
    return false;
  }
}
