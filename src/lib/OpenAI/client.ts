import OpenAI from "openai";
import { getStrictApiKey } from "../../store/useOpenAIKeyStore";

export default function createClient(): OpenAI {
  const apiKey = getStrictApiKey();
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}
