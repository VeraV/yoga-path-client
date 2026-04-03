import api from "../axios";
import { profileApi } from "../profileApi";

jest.mock("../axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("profileApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getByUserId", () => {
    it("calls GET /profiles/user/{userId} and returns profile data", async () => {
      const profileResponse = {
        id: 10,
        userId: 1,
        weeklyMinutesAvailable: 120,
        sessionsPerWeek: 3,
        dynamicPreference: "NO_PREFERENCE",
        structurePreference: "NO_PREFERENCE",
        philosophyOpenness: "NO_PREFERENCE",
        goals: [],
        createdAt: "2026-01-01T00:00:00",
        updatedAt: "2026-01-01T00:00:00",
      };

      mockedApi.get.mockResolvedValue({ data: profileResponse });

      // eslint-disable-next-line testing-library/no-await-sync-queries
      const result = await profileApi.getByUserId(1);

      expect(mockedApi.get).toHaveBeenCalledWith("/profiles/user/1");
      expect(result).toEqual(profileResponse);
    });
  });

  describe("create", () => {
    it("calls POST /profiles with request data and returns created profile", async () => {
      const requestData = {
        userId: 1,
        weeklyMinutesAvailable: 120,
        sessionsPerWeek: 3,
        dynamicPreference: "NO_PREFERENCE" as const,
        structurePreference: "NO_PREFERENCE" as const,
        philosophyOpenness: "NO_PREFERENCE" as const,
        goalIds: [1, 2],
      };
      const responseData = { id: 10, ...requestData, goals: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" };

      mockedApi.post.mockResolvedValue({ data: responseData });

      const result = await profileApi.create(requestData);

      expect(mockedApi.post).toHaveBeenCalledWith("/profiles", requestData);
      expect(result).toEqual(responseData);
    });
  });

  describe("update", () => {
    it("calls PUT /profiles/{id} with request data and returns updated profile", async () => {
      const requestData = {
        userId: 1,
        weeklyMinutesAvailable: 180,
        sessionsPerWeek: 4,
        dynamicPreference: "DYNAMIC" as const,
        structurePreference: "STRUCTURED" as const,
        philosophyOpenness: "OPEN" as const,
        goalIds: [1, 3],
      };
      const responseData = { id: 10, ...requestData, goals: [], createdAt: "2026-01-01", updatedAt: "2026-01-02" };

      mockedApi.put.mockResolvedValue({ data: responseData });

      const result = await profileApi.update(10, requestData);

      expect(mockedApi.put).toHaveBeenCalledWith("/profiles/10", requestData);
      expect(result).toEqual(responseData);
    });
  });
});
