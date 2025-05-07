import { type FilterOptions, type SelectOptions } from '@/components/DataView';
import { useDataViewContext } from '@/hooks/useDataViewContext';
import { blurOnReturn } from '@/utils/helpers';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-preact';
import { FunctionComponent } from 'preact';
import { Dispatch, StateUpdater } from 'preact/hooks';

export const FilterMenu: FunctionComponent = ({ children }) => {
  const { filters, setFilters, sorting, setSorting, sortOptions } =
    useDataViewContext();

  return (
    <div class="filter-menu">
      {filters.map((f) =>
        f.custom_item ? null : f.options ? (
          <FilterMenuSelect
            filterName={f.name}
            options={f.options}
            {...{ filters, setFilters }}
          />
        ) : (
          <FilterMenuInput filterName={f.name} {...{ filters, setFilters }} />
        )
      )}
      {sortOptions && <FilterMenuSort {...{ sorting, setSorting, sortOptions }} />}
      {children}
    </div>
  );
};

export const FilterMenuInput = ({
  filterName,
  filters,
  setFilters,
}: {
  filterName: string;
  filters: FilterOptions;
  setFilters: Dispatch<StateUpdater<FilterOptions>>;
}) => {
  const f = filters.find((f) => f.name === filterName);
  if (!f) {
    return null;
  }
  return (
    <div class="filter-menu-item">
      <label for={filterName}>{f.label}</label>
      <input
        type="text"
        id={filterName}
        value={f.value}
        onInput={(e) =>
          setFilters((f) =>
            f.map((el) => {
              if (el.name === filterName) {
                el.value = e.currentTarget.value;
              }
              return el;
            })
          )
        }
        onKeyUp={blurOnReturn}
      />
    </div>
  );
};

export const FilterMenuSelect = ({
  filterName,
  filters,
  setFilters,
  options,
}: {
  filterName: string;
  filters: FilterOptions;
  setFilters: Dispatch<StateUpdater<FilterOptions>>;
  options: SelectOptions;
}) => {
  const f = filters.find((f) => f.name === filterName);
  if (!f) {
    return null;
  }
  return (
    <div class="filter-menu-item">
      <label for={filterName}>{f.label}</label>
      <select
        id={filterName}
        value={f.value}
        onChange={(e) =>
          setFilters((f) =>
            f.map((el) => {
              if (el.name === filterName) {
                el.value = e.currentTarget.value;
              }
              return el;
            })
          )
        }
      >
        {options.map((o) => (
          <option value={o.name}>{o.label}</option>
        ))}
      </select>
    </div>
  );
};

export const FilterMenuSort = ({
  sorting,
  setSorting,
  sortOptions,
}: {
  sorting: {
    sortBy: string;
    sortAscending: boolean;
  };
  setSorting: Dispatch<StateUpdater<{ sortBy: string; sortAscending: boolean }>>;
  sortOptions: SelectOptions;
}) => {
  return (
    <div class="filter-menu-item ">
      <label for="sortBy">Sort by</label>
      <div class="filter-menu-item-sort">
        <select
          id="sortBy"
          value={sorting.sortBy}
          onInput={(e) => {
            setSorting((prev) => ({
              ...prev,
              sortBy: e.currentTarget.value,
            }));
          }}
        >
          {sortOptions.map((o) => (
            <option value={o.name}>{o.label}</option>
          ))}
        </select>
        <button
          class="icon-button"
          onClick={() => {
            setSorting((prev) => ({ ...prev, sortAscending: !prev.sortAscending }));
          }}
        >
          {sorting.sortAscending ? <IconArrowUp /> : <IconArrowDown />}
        </button>
      </div>
    </div>
  );
};
