import api from "../axios";
import { recommendationApi } from "../recommendationApi";

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

describe("recommendationApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLatest", () => {
    it("calls GET /recommendations/profile/{profileId}/latest and returns data", async () => {
      const recommendation = { id: 1, profileId: 10, totalMinutesPerSession: 40 };

      mockedApi.get.mockResolvedValue({ data: recommendation });

      const result = await recommendationApi.getLatest(10);

      expect(mockedApi.get).toHaveBeenCalledWith("/recommendations/profile/10/latest");
      expect(result).toEqual(recommendation);
    });
  });

  describe("getHistory", () => {
    it("calls GET /recommendations/profile/{profileId} and returns array", async () => {
      const history = [
        { id: 1, profileId: 10, totalMinutesPerSession: 40 },
        { id: 2, profileId: 10, totalMinutesPerSession: 35 },
      ];

      mockedApi.get.mockResolvedValue({ data: history });

      const result = await recommendationApi.getHistory(10);

      expect(mockedApi.get).toHaveBeenCalledWith("/recommendations/profile/10");
      expect(result).toEqual(history);
    });
  });

  describe("generate", () => {
    it("calls POST /recommendations/generate/{profileId} and returns new recommendation", async () => {
      const recommendation = { id: 3, profileId: 10, totalMinutesPerSession: 45 };

      mockedApi.post.mockResolvedValue({ data: recommendation });

      const result = await recommendationApi.generate(10);

      expect(mockedApi.post).toHaveBeenCalledWith("/recommendations/generate/10");
      expect(result).toEqual(recommendation);
    });
  });
});
