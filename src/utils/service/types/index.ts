export type TGetUniqueTypeofMatcher =
  | 'string'
  | 'number'
  | 'biginit'
  | 'object'
  | 'undefined'
  | 'symbol'
  | 'function'
  | 'boolean';

export type getDistanceFromMileReturnType = {
  meters: number;
  centimeters: number;
  kilometers: number;
  inches: number;
  feets: number;
};

export type PaginationReturn = {
  skip: number;
  limit: number;
  take: number;
  keyword?: string;
};
