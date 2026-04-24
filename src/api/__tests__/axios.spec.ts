import type { AxiosError, AxiosResponse } from "axios";
import api from "../axios";

type ResponseHandler = {
  fulfilled: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  rejected: (error: AxiosError) => unknown;
};

const responseHandler = (
  api.interceptors.response as unknown as { handlers: ResponseHandler[] }
).handlers[0];

const implSymbol = Object.getOwnPropertySymbols(window.location).find(
  (s) => s.description === "impl",
) as symbol;
const locationImplProto = Object.getPrototypeOf(
  (window.location as unknown as Record<symbol, object>)[implSymbol],
);
const originalHrefDescriptor = Object.getOwnPropertyDescriptor(
  locationImplProto,
  "href",
) as PropertyDescriptor;

const hrefSetter = jest.fn<void, [string]>();

beforeAll(() => {
  Object.defineProperty(locationImplProto, "href", {
    configurable: true,
    get: () => "",
    set: (v: string) => hrefSetter(v),
  });
});

afterAll(() => {
  Object.defineProperty(locationImplProto, "href", originalHrefDescriptor);
});

afterEach(() => {
  localStorage.clear();
  hrefSetter.mockClear();
});

describe("axios response interceptor -- 401 handling", () => {
  it("clears auth data from localStorage and redirects to /login on 401", async () => {
    localStorage.setItem("token", "jwt-token");
    localStorage.setItem("userId", "1");
    localStorage.setItem("email", "test@example.com");
    localStorage.setItem("name", "Test User");
    window.history.pushState({}, "", "/dashboard");

    const error = { response: { status: 401 } } as AxiosError;

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("userId")).toBeNull();
    expect(localStorage.getItem("email")).toBeNull();
    expect(localStorage.getItem("name")).toBeNull();
    expect(hrefSetter).toHaveBeenCalledWith("/login");
  });

  it("clears storage but does not redirect when already on /login (loop prevention)", async () => {
    localStorage.setItem("token", "jwt-token");
    window.history.pushState({}, "", "/login");

    const error = { response: { status: 401 } } as AxiosError;

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(localStorage.getItem("token")).toBeNull();
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("bubbles non-401 errors without touching storage or location", async () => {
    localStorage.setItem("token", "jwt-token");
    window.history.pushState({}, "", "/dashboard");

    const error = { response: { status: 500 } } as AxiosError;

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(hrefSetter).not.toHaveBeenCalled();
  });

  it("bubbles network errors (no response) without touching storage or location", async () => {
    localStorage.setItem("token", "jwt-token");
    window.history.pushState({}, "", "/dashboard");

    const error = {} as AxiosError;

    await expect(responseHandler.rejected(error)).rejects.toBe(error);

    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});
