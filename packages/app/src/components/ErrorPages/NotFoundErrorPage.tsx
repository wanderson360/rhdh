import type { AppComponents } from '@backstage/core-plugin-api';

import { ErrorPage } from './ErrorPage';

export const NotFoundErrorPage: AppComponents['NotFoundErrorPage'] = () => {
  return (
    <ErrorPage
      status="404"
      statusMessage="Página não encontrada"
      additionalInfo="Verifique o endereço ou volte para a página anterior."
    />
  );
};
