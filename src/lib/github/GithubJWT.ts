import jwt from "jsonwebtoken";
import crypto from "crypto";

export function generateGitHubJWT(appId: string): string {
  const rawKey = process.env.GITHUB_PRIVATE_KEY;

  if (!rawKey) {
    throw new Error("GITHUB_PRIVATE_KEY is not set");
  }
const pemKey = rawKey.replace(/\\n/g, "\n").trim();

const privateKey = crypto.createPrivateKey({
  key: Buffer.from(pemKey, "utf-8"),
  format: "pem",
});

  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  };

  return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}
