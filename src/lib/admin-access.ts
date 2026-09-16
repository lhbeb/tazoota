const REVOKED_ADMIN_EMAILS = new Set(
  (process.env.REVOKED_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.toLowerCase().trim())
    .filter(Boolean),
);

export function isRevokedAdminEmail(email: string | null | undefined): boolean {
  return REVOKED_ADMIN_EMAILS.has((email || '').toLowerCase().trim());
}
