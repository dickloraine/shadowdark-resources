import type {
  DataViewState,
  FilterOptions,
  SelectOptions,
} from '@/components/DataView';
import { getSlug } from '@/utils/helpers';
import { createContext, Provider } from 'preact';
import { useMemo, useState } from 'preact/hooks';

export const DataViewContext = createContext<DataViewState | null>(null);

/**
 * Provides a context and state management for a data view component.
 *
 * This hook creates a context provider and manages the state for sorting, filtering,
 * and other data view configurations. It is designed to be used with the `DataViewContext`
 * to share state across components.
 *
 * @param name - The name of the data view, used to generate a slug and identify the context.
 * @param filterOptions - An array of filter options to initialize the filter state.
 * @param sortOptions - (Optional) An array of sorting options to configure sorting behavior.
 *
 * @returns A tuple containing:
 * - The `Provider` component for the `DataViewContext`.
 * - The state object containing the current context values, including sorting, filters, and more.
 *
 * @example
 * ```tsx
 * const [DataViewProvider, dataViewState] = useDataViewContextProvider(
 *   'MyDataView',
 *   initialFilterOptions,
 *   initialSortOptions
 * );
 *
 * return (
 *   <DataViewProvider value={dataViewState}>
 *     <MyComponent />
 *   </DataViewProvider>
 * );
 * ```
 */
export const useDataViewContextProvider = (
  name: string,
  filterOptions: FilterOptions,
  sortOptions?: SelectOptions
): [Provider<DataViewState | null>, DataViewState] => {
  const [sorting, setSorting] = useState({ sortBy: 'name', sortAscending: true });
  const [filters, setFilters] = useState(filterOptions.map((f) => ({ ...f })));
  name = useMemo(() => name, [name]);
  const slug = useMemo(() => getSlug(name), [name]);
  const contextValue = {
    name,
    slug,
    sorting,
    setSorting,
    sortOptions,
    filters,
    setFilters,
  };
  return [DataViewContext.Provider, contextValue];
};
