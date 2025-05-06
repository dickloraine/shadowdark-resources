import { useDataViewContext } from '@/hooks/useDataViewContext';
import { sortFunction } from '@/utils/filters';
import type { JSX } from 'preact';
import { FunctionComponent } from 'preact';
import { Dispatch, StateUpdater } from 'preact/hooks';

export interface NamedData {
  name: string;
  slug: string;
}

export type SelectOptions = { name: string; label: string }[];

export type FilterFunction = <T extends NamedData>(data: T[]) => T[];

export type FilterPredicate = (el: any, attr: string, target: string) => boolean;

type Sorting = {
  sortBy: string;
  sortAscending: boolean;
};

export type DataViewState = {
  name: string;
  slug: string;
  filters: FilterOptions;
  setFilters: Dispatch<StateUpdater<FilterOptions>>;
  sorting: Sorting;
  setSorting: Dispatch<StateUpdater<Sorting>>;
  sortOptions?: SelectOptions;
};

export type FilterOptions = {
  name: string;
  key: string;
  value: string;
  label: string;
  function: FilterPredicate;
  options?: SelectOptions;
  custom_item?: boolean;
}[];

type DataViewProps<T extends NamedData> = {
  data: T[];
  RenderComponent: ({ el }: { el: T }) => JSX.Element;
  ContentContainer?: FunctionComponent;
  filterFunction?: FilterFunction;
};

export const DataView = <T extends NamedData>({
  data,
  RenderComponent,
  ContentContainer,
  filterFunction,
}: DataViewProps<T>): JSX.Element => {
  const { slug, filters, sorting } = useDataViewContext();

  if (!ContentContainer) {
    ContentContainer = ({ children }) => (
      <div class={`dataview-content ${slug}-content`}>{children}</div>
    );
  }

  if (!filterFunction) {
    filterFunction = (data) =>
      data.filter((el) => filters.every((f) => f.function(el, f.key, f.value)));
  }

  return (
    <div class={`dataview dataview-${slug}`}>
      <ContentContainer>
        {filterFunction(data)
          .sort(sortFunction(sorting.sortBy, sorting.sortAscending))
          .map((el) => (
            <RenderComponent el={el} key={el.name} />
          ))}
      </ContentContainer>
    </div>
  );
};
