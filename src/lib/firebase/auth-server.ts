import { createSign } from "crypto";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

function getServiceAccount(): ServiceAccount | null {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const raw = base64
    ? Buffer.from(base64, "base64").toString("utf8")
    : json;

  if (!raw) return null;

  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (!sa.project_id || !sa.client_email || !sa.private_key) return null;
    sa.private_key = normalizePrivateKey(sa.private_key);
    return sa;
  } catch {
    return null;
  }
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, sa: ServiceAccount): string {
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  const unsigned = `${header}.${body}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  return `${unsigned}.${sign.sign(sa.private_key, "base64url")}`;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    {
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope:
        "https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase.database",
    },
    sa
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google OAuth failed: ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("No access token returned");
  return data.access_token;
}

async function lookupUserByEmail(
  projectId: string,
  email: string,
  accessToken: string
): Promise<string | null> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: [email] }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 400 && text.includes("EMAIL_NOT_FOUND")) return null;
    throw new Error(`User lookup failed: ${text}`);
  }

  const data = (await res.json()) as { users?: { localId: string }[] };
  return data.users?.[0]?.localId ?? null;
}

async function createUser(
  projectId: string,
  email: string,
  accessToken: string
): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, emailVerified: true }),
    }
  );

  if (!res.ok) {
    throw new Error(`Create user failed: ${await res.text()}`);
  }

  const data = (await res.json()) as { localId: string };
  return data.localId;
}

export function createFirebaseCustomToken(uid: string, sa: ServiceAccount): string {
  const now = Math.floor(Date.now() / 1000);
  return signJwt(
    {
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      iat: now,
      exp: now + 3600,
      uid,
    },
    sa
  );
}

export async function issueAuthTokenForEmail(
  email: string
): Promise<{ token: string; uid: string }> {
  const sa = getServiceAccount();
  if (!sa) throw new Error("Firebase service account not configured");

  const accessToken = await getAccessToken(sa);
  let uid = await lookupUserByEmail(sa.project_id, email, accessToken);

  if (!uid) {
    uid = await createUser(sa.project_id, email, accessToken);
  }

  const token = createFirebaseCustomToken(uid, sa);
  return { token, uid };
}

export async function testAuthServer(): Promise<boolean> {
  const sa = getServiceAccount();
  if (!sa) return false;
  const accessToken = await getAccessToken(sa);
  return Boolean(accessToken);
}
