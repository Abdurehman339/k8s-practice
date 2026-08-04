import { TPaginationData } from 'utils/interfaces/return';

export const PaginationResponse = (
  count: number = 0,
  pages: number = 0,
): TPaginationData => {
  return {
    count,
    pages,
  };
};
