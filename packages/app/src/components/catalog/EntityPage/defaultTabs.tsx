import { Entity } from '@backstage/catalog-model';
import { isKind } from '@backstage/plugin-catalog';

import { isType } from '../utils';
import { ApiTabContent } from './ApiTabContent';
import { DefinitionTabContent } from './DefinitionTabContent';
import { DependenciesTabContent } from './DependenciesTabContent';
import { DiagramTabContent } from './DiagramTabContent';
import { DynamicEntityTabProps } from './DynamicEntityTab';
import { OverviewTabContent } from './OverviewTabContent';

/**
 * The default set of entity tabs in the default order
 */
export const defaultTabs: Record<
  string,
  Omit<DynamicEntityTabProps, 'if' | 'children' | 'path'>
> = {
  '/': {
    title: 'Visão geral',
    mountPoint: 'entity.page.overview',
  },
  '/topology': {
    title: 'Topologia',
    mountPoint: 'entity.page.topology',
  },
  '/issues': {
    title: 'Problemas',
    mountPoint: 'entity.page.issues',
  },
  '/pr': {
    title: 'Solicitações de pull/merge',
    mountPoint: 'entity.page.pull-requests',
  },
  '/ci': {
    title: 'Integração contínua',
    mountPoint: 'entity.page.ci',
  },
  '/cd': {
    title: 'Entrega contínua',
    mountPoint: 'entity.page.cd',
  },
  '/kubernetes': {
    title: 'Kubernetes',
    mountPoint: 'entity.page.kubernetes',
  },
  '/image-registry': {
    title: 'Registro de imagens',
    mountPoint: 'entity.page.image-registry',
  },
  '/monitoring': {
    title: 'Monitoramento',
    mountPoint: 'entity.page.monitoring',
  },
  '/lighthouse': {
    title: 'Lighthouse',
    mountPoint: 'entity.page.lighthouse',
  },
  '/api': {
    title: 'APIs',
    mountPoint: 'entity.page.api',
  },
  '/dependencies': {
    title: 'Dependências',
    mountPoint: 'entity.page.dependencies',
  },
  '/docs': {
    title: 'Documentação',
    mountPoint: 'entity.page.docs',
  },
  '/definition': {
    title: 'Definição',
    mountPoint: 'entity.page.definition',
  },
  '/system': {
    title: 'Diagrama',
    mountPoint: 'entity.page.diagram',
  },
};

/**
 * Additional tab visibility rules for specific entity routes
 */
export const tabRules: Record<
  string,
  Omit<DynamicEntityTabProps, 'path' | 'title' | 'mountPoint' | 'children'>
> = {
  '/api': {
    if: (entity: Entity) =>
      isType('service')(entity) && isKind('component')(entity),
  },
  '/dependencies': {
    if: isKind('component'),
  },
  '/definition': {
    if: isKind('api'),
  },
  '/system': {
    if: isKind('system'),
  },
};

/**
 * Additional child elements to be rendered at specific entity routes
 */
export const tabChildren: Record<
  string,
  Omit<DynamicEntityTabProps, 'path' | 'title' | 'mountPoint' | 'if'>
> = {
  '/': {
    children: <OverviewTabContent />,
  },
  '/api': {
    children: <ApiTabContent />,
  },
  '/dependencies': {
    children: <DependenciesTabContent />,
  },
  '/definition': {
    children: <DefinitionTabContent />,
  },
  '/system': {
    children: <DiagramTabContent />,
  },
};
