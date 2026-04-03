import api from "../axios";
import { practiceLogApi } from "../practiceLogApi";

jest.mock("../axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("practiceLogApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getByUserId", () => {
    it("calls GET /practice-logs/user/{userId} and returns logs", async () => {
      const logs = [{ id: 1, userId: 1, practiceDate: "2026-04-01", minutesPracticed: 30 }];

      mockedApi.get.mockResolvedValue({ data: logs });

      // eslint-disable-next-line testing-library/no-await-sync-queries
      const result = await practiceLogApi.getByUserId(1);

      expect(mockedApi.get).toHaveBeenCalledWith("/practice-logs/user/1");
      expect(result).toEqual(logs);
    });
  });

  describe("getByDateRange", () => {
    it("calls GET /practice-logs/user/{userId}/range with query params", async () => {
      const logs = [{ id: 1, userId: 1, practiceDate: "2026-04-01", minutesPracticed: 30 }];

      mockedApi.get.mockResolvedValue({ data: logs });

      // eslint-disable-next-line testing-library/no-await-sync-queries
      const result = await practiceLogApi.getByDateRange(1, "2026-03-01", "2026-04-01");

      expect(mockedApi.get).toHaveBeenCalledWith("/practice-logs/user/1/range", {
        params: { startDate: "2026-03-01", endDate: "2026-04-01" },
      });
      expect(result).toEqual(logs);
    });
  });

  describe("create", () => {
    it("calls POST /practice-logs with request data and returns created log", async () => {
      const requestData = { userId: 1, practiceDate: "2026-04-01", minutesPracticed: 45, notes: "Great session" };
      const responseData = { id: 1, ...requestData, createdAt: "2026-04-01T10:00:00" };

      mockedApi.post.mockResolvedValue({ data: responseData });

      const result = await practiceLogApi.create(requestData);

      expect(mockedApi.post).toHaveBeenCalledWith("/practice-logs", requestData);
      expect(result).toEqual(responseData);
    });
  });

  describe("update", () => {
    it("calls PUT /practice-logs/{id} with request data and returns updated log", async () => {
      const requestData = { userId: 1, practiceDate: "2026-04-01", minutesPracticed: 60, notes: "Updated" };
      const responseData = { id: 1, ...requestData, createdAt: "2026-04-01T10:00:00" };

      mockedApi.put.mockResolvedValue({ data: responseData });

      const result = await practiceLogApi.update(1, requestData);

      expect(mockedApi.put).toHaveBeenCalledWith("/practice-logs/1", requestData);
      expect(result).toEqual(responseData);
    });
  });

  describe("delete", () => {
    it("calls DELETE /practice-logs/{id}", async () => {
      mockedApi.delete.mockResolvedValue({});

      await practiceLogApi.delete(1);

      expect(mockedApi.delete).toHaveBeenCalledWith("/practice-logs/1");
    });
  });
});
