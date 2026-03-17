import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyCronAuth } from '../../../api/lib/cron-auth';

describe('verifyCronAuth', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'test-secret-123');
  });

  it('returns null when authorization matches CRON_SECRET', () => {
    const headers = new Headers({ Authorization: 'Bearer test-secret-123' });
    const result = verifyCronAuth(headers);
    expect(result).toBeNull();
  });

  it('returns 401 Response when authorization is missing', () => {
    const headers = new Headers();
    const result = verifyCronAuth(headers);
    expect(result).toBeInstanceOf(Response);
    expect(result!.status).toBe(401);
  });

  it('returns 401 Response when authorization is wrong', () => {
    const headers = new Headers({ Authorization: 'Bearer wrong-secret' });
    const result = verifyCronAuth(headers);
    expect(result).toBeInstanceOf(Response);
    expect(result!.status).toBe(401);
  });
});
