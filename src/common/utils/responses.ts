export const createErrorResponse = (error: string) => ({
  success: false,
  error,
  data: null,
});

export const createSuccessResponse = <T = object>(data: T) => ({
  success: true,
  error: null,
  data,
});
