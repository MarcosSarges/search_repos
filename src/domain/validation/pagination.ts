import { createAppError } from '../errors/app-error';

export function assertPage(page: number): void {
  if (page < 1) {
    throw createAppError('invalid_input');
  }
}

export function assertPerPage(perPage: number | undefined): void {
  if (perPage === undefined) {
    return;
  }
  if (perPage < 1) {
    throw createAppError('invalid_input');
  }
}
