import api from "../axios";
import { authApi } from "../authApi";

jest.mock("../axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("authApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("calls POST /auth/login with credentials and returns response data", async () => {
      const loginData = { email: "test@example.com", password: "password123" };
      const loginResponse = {
        token: "jwt-token",
        userId: 1,
        email: "test@example.com",
        name: "Test User",
      };

      mockedApi.post.mockResolvedValue({ data: loginResponse });

      const result = await authApi.login(loginData);

      expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(result).toEqual(loginResponse);
    });
  });

  describe("register", () => {
    it("calls POST /auth/register with user data and returns response data", async () => {
      const registerData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };
      const registerResponse = {
        token: "jwt-token",
        userId: 1,
        email: "test@example.com",
        name: "Test User",
      };

      mockedApi.post.mockResolvedValue({ data: registerResponse });

      const result = await authApi.register(registerData);

      expect(mockedApi.post).toHaveBeenCalledWith(
        "/auth/register",
        registerData,
      );
      expect(result).toEqual(registerResponse);
    });
  });

  describe("verify", () => {
    it("calls GET /auth/verify and returns user data", async () => {
      const userResponse = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        enabled: true,
        createdAt: "2026-01-01T00:00:00",
      };

      mockedApi.get.mockResolvedValue({ data: userResponse });

      const result = await authApi.verify();

      expect(mockedApi.get).toHaveBeenCalledWith("/auth/verify");
      expect(result).toEqual(userResponse);
    });
  });
});
