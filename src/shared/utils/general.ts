import curry from "lodash/curry";
import flow from "lodash/flow";

export const objectMap = curry((fn: (...value: any) => any, obj: any) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]))
);

export const pipe = flow;
