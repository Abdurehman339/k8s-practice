export type TPaginationData = {
  count?: number;
  pages?: number;
};

type TResponseData =
  | {
      status?: boolean;
      code?: number;
      message?: string;
      data?: any[] | object | null | string | number;
      pagination?: TPaginationData;
      context?:
        | string
        | Array<string>
        | Record<string, string>
        | object
        | Array<object>;
      bearer?: string;
    }
  | string
  | Array<any>
  | object
  | boolean;

export type TResponse = TResponseData | never;
