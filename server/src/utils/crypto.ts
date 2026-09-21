import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const RAW_KEY = process.env.ENCRYPTION_KEY || ""; 
const IV_LENGTH = 16; 

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(RAW_KEY)
  .digest(); 

export function encrypt(text: string): string {
  if (!text) return "";
  
  if (!RAW_KEY) {
    throw new Error("A variável de ambiente ENCRYPTION_KEY não está definida!");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Gera um hash irreversível (HMAC-SHA256) do UID de uma conta Google.
 * Usado para reconhecer contas que regressam, sem NUNCA guardar o email,
 * nome ou foto do Google — nem o próprio developer consegue reverter este
 * hash para descobrir a identidade da conta.
 */
export function hashGoogleId(googleUid: string): string {
  const pepper = process.env.GOOGLE_ID_PEPPER || RAW_KEY;
  if (!pepper) {
    throw new Error(
      "A variável de ambiente GOOGLE_ID_PEPPER (ou ENCRYPTION_KEY) não está definida!",
    );
  }
  return crypto.createHmac("sha256", pepper).update(googleUid).digest("hex");
}

export function decrypt(text: string): string {
  if (!text) return "";
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts.shift() || "", "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Falha ao descriptografar o número:", error);
    return "";
  }
}