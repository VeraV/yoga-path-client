import api from "../axios";
import { referenceApi } from "../referenceApi";

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

describe("referenceApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getGoals", () => {
    it("calls GET /goals and returns goal list", async () => {
      const goals = [
        { id: 1, name: "Flexibility" },
        { id: 2, name: "Strength" },
      ];

      mockedApi.get.mockResolvedValue({ data: goals });

      const result = await referenceApi.getGoals();

      expect(mockedApi.get).toHaveBeenCalledWith("/goals");
      expect(result).toEqual(goals);
    });
  });

  describe("getYogaStyles", () => {
    it("calls GET /yoga-styles and returns yoga style list", async () => {
      const yogaStyles = [
        { id: 1, name: "Hatha", description: "Traditional yoga", notes: "" },
        { id: 2, name: "Vinyasa", description: "Flow yoga", notes: "" },
      ];

      mockedApi.get.mockResolvedValue({ data: yogaStyles });

      const result = await referenceApi.getYogaStyles();

      expect(mockedApi.get).toHaveBeenCalledWith("/yoga-styles");
      expect(result).toEqual(yogaStyles);
    });
  });

  describe("getLimitations", () => {
    it("calls GET /limitations and returns limitation list", async () => {
      const limitations = [
        { id: 1, name: "Asthma", description: "Respiratory condition", notes: "Avoid intense breathing" },
        { id: 2, name: "Pregnancy", description: "Prenatal care needed", notes: "Modify poses" },
      ];

      mockedApi.get.mockResolvedValue({ data: limitations });

      const result = await referenceApi.getLimitations();

      expect(mockedApi.get).toHaveBeenCalledWith("/limitations");
      expect(result).toEqual(limitations);
    });
  });
});
