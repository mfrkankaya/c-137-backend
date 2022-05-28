export const createErrorResponse = (error: string) =>
  ({
    success: false,
    error,
    data: null,
  } as { success: false; error: string; data: null });

export const createSuccessResponse = <T = object>(data: T) =>
  ({
    success: true,
    error: null,
    data,
  } as { success: true; error: null; data: T });
