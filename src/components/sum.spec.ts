import { sum } from "./sum";

test("suming 5 and 2 will return 7", () => {
  const a: number = 5;
  expect(a).toBe(5);
  expect(sum(5, 2)).toBe(7);
});
