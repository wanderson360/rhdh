import { useEffect } from 'react';

import { Content, PageWithHeader } from '@backstage/core-components';
import { CatalogTable } from '@backstage/plugin-catalog';
import {
  CatalogFilterLayout,
  EntityAutocompletePicker,
  EntityLifecycleFilter,
  EntityListProvider,
  EntityNamespaceFilter,
  EntityOwnerFilter,
  EntityTagFilter,
  EntityTextFilter,
  useEntityList,
  useEntityOwnership,
  UserListFilter,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';

import { Button, ButtonGroup, TextField } from '@mui/material';

const catalogColumns = [
  { ...CatalogTable.columns.createNameColumn(), title: 'Nome' },
  { ...CatalogTable.columns.createSystemColumn(), title: 'Sistema' },
  { ...CatalogTable.columns.createOwnerColumn(), title: 'Responsável' },
  {
    ...CatalogTable.columns.createSpecTypeColumn({ hidden: false }),
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

function CatalogUserFilterPT() {
  const { filters, updateFilters } = useEntityList();
  const { isOwnedEntity } = useEntityOwnership();
  const { isStarredEntity } = useStarredEntities();

  useEffect(() => {
    if (!filters.user) {
      updateFilters({
        user: new UserListFilter('owned', isOwnedEntity, isStarredEntity),
      });
    }
  }, [filters.user, isOwnedEntity, isStarredEntity, updateFilters]);

  const selectedFilter = filters.user?.value ?? 'owned';
  const filtersToShow = [
    { value: 'owned' as const, label: 'Meus Componentes' },
    { value: 'starred' as const, label: 'Favoritos' },
    { value: 'all' as const, label: 'Todos' },
  ];

  return (
    <ButtonGroup
      aria-label="Filtrar componentes"
      orientation="vertical"
      fullWidth
    >
      {filtersToShow.map(filter => (
        <Button
          key={filter.value}
          aria-pressed={selectedFilter === filter.value}
          color={selectedFilter === filter.value ? 'primary' : 'inherit'}
          onClick={() =>
            updateFilters({
              user: new UserListFilter(
                filter.value,
                isOwnedEntity,
                isStarredEntity,
              ),
            })
          }
        >
          {filter.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function CatalogContentPT() {
  const { filters, updateFilters } = useEntityList();
  const tableTitle =
    filters.user?.value === 'starred'
      ? 'Favoritos'
      : filters.user?.value === 'all'
        ? 'Todos os Componentes'
        : 'Meus Componentes';

  return (
    <CatalogFilterLayout>
      <CatalogFilterLayout.Filters>
        <CatalogUserFilterPT />
        <TextField
          label="Pesquisar"
          value={filters.text?.value ?? ''}
          onChange={event =>
            updateFilters({
              text: event.target.value
                ? new EntityTextFilter(event.target.value)
                : undefined,
            })
          }
        />
        <EntityAutocompletePicker
          label="Ciclo de vida"
          name="lifecycles"
          path="spec.lifecycle"
          Filter={EntityLifecycleFilter}
        />
        <EntityAutocompletePicker
          label="Responsável"
          name="owners"
          path="spec.owner"
          Filter={EntityOwnerFilter}
        />
        <EntityAutocompletePicker
          label="Namespace"
          name="namespace"
          path="metadata.namespace"
          Filter={EntityNamespaceFilter}
        />
        <EntityAutocompletePicker
          label="Etiquetas"
          name="tags"
          path="metadata.tags"
          Filter={EntityTagFilter}
        />
      </CatalogFilterLayout.Filters>
      <CatalogFilterLayout.Content>
        <CatalogTable title={tableTitle} columns={catalogColumns} />
      </CatalogFilterLayout.Content>
    </CatalogFilterLayout>
  );
}

export function CatalogPagePT() {
  return (
    <EntityListProvider pagination>
      <PageWithHeader title="Catálogo" themeId="home">
        <Content>
          <CatalogContentPT />
        </Content>
      </PageWithHeader>
    </EntityListProvider>
  );
}
