import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';

const selectSingleMock = jest.fn();
const insertSingleMock = jest.fn();

jest.unstable_mockModule('../supabaseClient.js', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: selectSingleMock
                }))
            })),
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: insertSingleMock
                }))
            }))
        }))
    }
}));

const app = (await import('../index.js')).default;

describe('Tests Auth Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/login', () => {

        it('will return 200 and give a token', async () => {
            const password = "mdp123";
            const hashedPassword = await bcrypt.hash(password, 10);

            selectSingleMock.mockResolvedValue({
                data: { login: "testuser", password: hashedPassword },
                error: null
            });

            const authHeader = Buffer.from(`testuser:${password}`).toString('base64');

            const res = await request(app)
                .get('/api/login')
                .set('Authorization', `Basic ${authHeader}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('will return 401 with a wrong password', async () => {
            const realPassword = "vraiPassword";
            const hashedPassword = await bcrypt.hash(realPassword, 10);

            selectSingleMock.mockResolvedValue({
                data: { login: "testuser", password: hashedPassword },
                error: null
            });

            const authHeader = Buffer.from('testuser:marchepas').toString('base64');

            const res = await request(app)
                .get('/api/login')
                .set('Authorization', `Basic ${authHeader}`);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('will return 401 if the user does not exist', async () => {
            selectSingleMock.mockResolvedValue({ data: null, error: { message: "Not found" } });

            const authHeader = Buffer.from('jsp:mdp123').toString('base64');

            const res = await request(app)
                .get('/api/login')
                .set('Authorization', `Basic ${authHeader}`);

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('will return 401 if there is not Authorization header', async () => {
            const res = await request(app).get('/api/login');

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Missing or invalid Authorization header. Expected 'Basic <base64(username:password)>'");
        });

        it('will return 401 if the Authorization header is incorrect', async () => {
            const res = await request(app)
                .get('/api/login')
                .set('Authorization', 'Bearer token_incorrect');

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Missing or invalid Authorization header. Expected 'Basic <base64(username:password)>'");
        });

        it('will return 401 if username or password is missing', async () => {
            const authHeader = Buffer.from(':mdp123').toString('base64');

            const res = await request(app)
                .get('/api/login')
                .set('Authorization', `Basic ${authHeader}`);

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('username or password missing');
        });
    });

    describe('POST /api/sign_up', () => {
        it('will create a user successfully and reeturn 201', async () => {
            selectSingleMock.mockResolvedValueOnce({ data: null, error: null });
            insertSingleMock.mockResolvedValueOnce({
                data: { id: 1, login: "newuser", password: "mdp123" },
                error: null
            });

            const res = await request(app)
                .post('/api/sign_up')
                .send({ login: "newuser2", password: "mdp123" });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe("User signed up successfully");
        });

        it('will return 409 if the login already exists', async () => {
            selectSingleMock.mockResolvedValue({
                data: { id: 1, login: "existingUser", password: "mdp123" },
                error: null
            });

            const res = await request(app)
                .post('/api/sign_up')
                .send({ login: "existingUser", password: "mdp123" });

            expect(res.status).toBe(409);
            expect(res.body.error).toBe("login already registered");
        });
    });
});
