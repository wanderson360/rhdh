import { useEffect } from 'react';

import {
  Content,
  ContentHeader,
  CreateButton,
  PageWithHeader,
  SupportButton,
} from '@backstage/core-components';
import { CatalogTable } from '@backstage/plugin-catalog';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import {
  CatalogFilterLayout,
  EntityAutocompletePicker,
  EntityKindFilter,
  EntityLifecycleFilter,
  EntityListProvider,
  EntityOwnerFilter,
  EntityTagFilter,
  EntityTextFilter,
  EntityTypeFilter,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { usePermission } from '@backstage/plugin-permission-react';

import TextField from '@mui/material/TextField';

const apiColumns = [
  { ...CatalogTable.columns.createTitleColumn({ hidden: true }) },
  {
    ...CatalogTable.columns.createNameColumn({ defaultKind: 'API' }),
    title: 'Nome',
  },
  { ...CatalogTable.columns.createSystemColumn(), title: 'Sistema' },
  { ...CatalogTable.columns.createOwnerColumn(), title: 'Responsável' },
  {
    ...CatalogTable.columns.createSpecTypeColumn(),
    title: 'Tipo',
  },
  {
    ...CatalogTable.columns.createSpecLifecycleColumn(),
    title: 'Ciclo de vida',
  },
  {
    ...CatalogTable.columns.createMetadataDescriptionColumn(),
    title: 'Descrição',
  },
  { ...CatalogTable.columns.createTagsColumn(), title: 'Etiquetas' },
];

const ApiListPT = () => {
  const { filters, updateFilters } = useEntityList();

  useEffect(() => {
    if (!filters.kind) {
      updateFilters({ kind: new EntityKindFilter('api', 'API') });
    }
  }, [filters.kind, updateFilters]);

  return (
    <CatalogFilterLayout>
      <CatalogFilterLayout.Filters>
        <TextField
          label="Pesquisar APIs"
          value={filters.text?.value ?? ''}
          onChange={event =>
            updateFilters({
              text: event.target.value
                ? new EntityTextFilter(event.target.value)
                : undefined,
            })
          }
        />
        <TextField
          label="Tipo"
          value={
            Array.isArray(filters.type?.value)
              ? filters.type.value.join(', ')
              : (filters.type?.value ?? '')
          }
          onChange={event =>
            updateFilters({
              type: event.target.value
                ? new EntityTypeFilter(event.target.value)
                : undefined,
            })
          }
        />
        <EntityAutocompletePicker
          label="Responsável"
          name="owners"
          path="spec.owner"
          Filter={EntityOwnerFilter}
        />
        <EntityAutocompletePicker
          label="Ciclo de vida"
          name="lifecycles"
          path="spec.lifecycle"
          Filter={EntityLifecycleFilter}
        />
        <EntityAutocompletePicker
          label="Etiquetas"
          name="tags"
          path="metadata.tags"
          Filter={EntityTagFilter}
        />
      </CatalogFilterLayout.Filters>
      <CatalogFilterLayout.Content>
        <CatalogTable title="APIs" columns={apiColumns} />
      </CatalogFilterLayout.Content>
    </CatalogFilterLayout>
  );
};

const ApiPageActionsPT = () => {
  const { allowed } = usePermission({
    permission: catalogEntityCreatePermission,
  });

  return (
    <>
      {allowed && <CreateButton title="Criar API" to="/catalog-import" />}
      <SupportButton>Ajuda para a documentação de APIs</SupportButton>
    </>
  );
};

export const ApiExplorerPagePT = () => (
  <EntityListProvider pagination>
    <PageWithHeader
      title="APIs"
      subtitle="Explore as APIs disponíveis no catálogo."
      themeId="apis"
    >
      <Content>
        <ContentHeader title="">
          <ApiPageActionsPT />
        </ContentHeader>
        <ApiListPT />
      </Content>
    </PageWithHeader>
  </EntityListProvider>
);
