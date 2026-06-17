export function assertAdminAccess(adminKey: string) {
  const expected = process.env.ADMIN_ACCESS_KEY;

  if (!expected) {
    throw new Error("ADMIN_ACCESS_KEY is not configured in the server environment.");
  }

  if (!adminKey || adminKey !== expected) {
    throw new Error("Access denied.");
  }
}
