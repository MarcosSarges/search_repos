import { isAppError, type AppErrorCode } from '@/domain';

const APP_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  rate_limit: 'Limite de requisições atingido. Tente novamente em instantes.',
  network: 'Falha de conexão. Verifique sua internet e tente novamente.',
  not_found: 'Recurso não encontrado.',
  empty_query: 'Informe um termo de busca.',
  invalid_input: 'Dados inválidos. Revise e tente novamente.',
  unauthorized: 'Não autorizado. Verifique suas credenciais.',
  forbidden: 'Acesso negado a este recurso.',
  aborted: 'A operação foi cancelada.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.',
};

export function mapAppErrorToMessage(error: unknown): string {
  if (isAppError(error) && error.code in APP_ERROR_MESSAGES) {
    return APP_ERROR_MESSAGES[error.code];
  }
  return APP_ERROR_MESSAGES.unknown;
}
