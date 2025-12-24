  import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users';

describe('/api/users API Route', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns 200 and users list', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            email: expect.any(String),
          }),
        ]),
      });
    });

    it('returns 405 for invalid method', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
      });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed',
      });
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const { req, res } = createMocks({
        method: 'POST',
        body: newUser,
      });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response).toMatchObject({
        id: expect.any(String),
        ...newUser,
      });
    });

    it('returns 400 for invalid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { name: 'John' }, // Missing email
      });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(res._getStatusCode()).toBe(400);
    });
  });
});
