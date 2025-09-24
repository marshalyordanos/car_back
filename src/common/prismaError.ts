import { Prisma } from '@prisma/client';

export function getPrismaErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const fields = (error.meta?.target as string[]).join(', ');
        return `Duplicate value detected for fields: ${fields}`;
      case 'P2003':
        // Foreign key violation
        return `Foreign key constraint failed on field: ${(error.meta?.field as string) || 'unknown'}`;
      case 'P2025':
        // Record not found
        const model = (error.meta?.modelName as string) || 'Unknown';
        return `No ${model} record found for the requested operation.`;
      default:
        return error.message || 'Database error';
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return `Validation error: ${error.message}`;
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return `Unknown database error: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Internal server error';
}
