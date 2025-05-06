import type {
  FilterFunction,
  FilterOptions,
  NamedData,
  SelectOptions,
} from '@/components/DataView';
import { DataView } from '@/components/DataView';
import { FilterMenu } from '@/components/FilterMenu';
import { useDataViewContextProvider } from '@/hooks/useDataViewContextProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getSlug } from '@/utils/helpers';
import {
  IconAlignLeft,
  IconColumns,
  IconEye,
  IconEyeOff,
  IconTable,
} from '@tabler/icons-preact';
import { FunctionComponent, JSX } from 'preact';
import { Dispatch, StateUpdater, useCallback, useState } from 'preact/hooks';
import { Link, useRoute } from 'wouter-preact';
import { SingleDataPageElement } from './SingleDataPageElement';

type DataPageTable<T extends NamedData> = {
  head: string[];
  row: (keyof T)[];
};

type Layout = 'onecolumn' | 'twocolumns' | 'table';

type ShadowdarkDataPageProps<T extends NamedData> = {
  name: string;
  data: T[];
  RenderComponent: ({ el }: { el: T }) => JSX.Element;
  sortOptions: SelectOptions;
  filterOptions: FilterOptions;
  table: DataPageTable<T>;
  filterFunction?: FilterFunction;
  startWithLayout?: Layout;
  hasImages?: boolean;
};

export const ShadowdarkDataPage = <T extends NamedData>({
  name,
  data,
  RenderComponent,
  sortOptions,
  filterOptions,
  table,
  startWithLayout = 'onecolumn',
  hasImages = false,
  filterFunction,
}: ShadowdarkDataPageProps<T>): JSX.Element | null => {
  const slug = getSlug(name);
  const [match, params] = useRoute<{ name?: string }>(`/${slug}/:name?`);
  const [DataViewContextProvider, contextValue] = useDataViewContextProvider(
    name,
    filterOptions,
    sortOptions
  );
  const [layout, setLayout] = useState<Layout>(startWithLayout);
  const [showImages, setShowImages] = useState(hasImages);

  if (!match) {
    return null;
  }
  const singleElement = params?.name;

  const style = `datapage-${slug} ${
    layout === 'twocolumns' && !singleElement && 'datapage-twocolumns'
  } ${hasImages && !showImages && 'datapage-no-images'}`;

  if (singleElement) {
    return (
      <SingleDataPageElement
        elementName={singleElement}
        {...{ data, name, slug, style, RenderComponent }}
      />
    );
  }

  let ContentContainer;
  if (layout === 'table') {
    [ContentContainer, RenderComponent] = getTableComponents(table, slug);
  }

  return (
    <DataViewContextProvider value={contextValue}>
      <div class={style}>
        <h1 id={slug}>{name}</h1>
        <FilterMenu>
          {hasImages && <FilterMenuImages {...{ showImages, setShowImages }} />}
          <FilterMenuLayout {...{ layout, setLayout }} />
        </FilterMenu>
        <DataView
          {...{
            data,
            RenderComponent,
            filterFunction,
            ContentContainer,
          }}
        />
      </div>
    </DataViewContextProvider>
  );
};

const FilterMenuLayout = ({
  layout,
  setLayout,
}: {
  layout: Layout;
  setLayout: Dispatch<StateUpdater<Layout>>;
}) => {
  const isMobile = useMediaQuery('(max-width: 600px)');
  const cycleLayouts = useCallback(() => {
    let newLayout: Layout = isMobile
      ? layout === 'table'
        ? 'onecolumn'
        : 'table'
      : layout === 'onecolumn'
      ? 'twocolumns'
      : layout === 'twocolumns'
      ? 'table'
      : 'onecolumn';
    setLayout(newLayout);
  }, [layout, isMobile, setLayout]);
  return (
    <div class="filter-menu-item-layout">
      <button class="icon-button" onClick={cycleLayouts}>
        {layout === 'onecolumn' ? (
          <IconAlignLeft size={17} />
        ) : layout === 'twocolumns' ? (
          <IconColumns size={17} />
        ) : (
          <IconTable size={17} />
        )}
      </button>
    </div>
  );
};

const FilterMenuImages = ({
  showImages,
  setShowImages,
}: {
  showImages: boolean;
  setShowImages: Dispatch<StateUpdater<boolean>>;
}) => {
  return (
    <div class="filter-menu-item-images">
      <button class="icon-button" onClick={() => setShowImages((prev) => !prev)}>
        {showImages ? <IconEye size={17} /> : <IconEyeOff size={17} />}
      </button>
    </div>
  );
};

const getTableComponents = <T extends NamedData>(
  table: DataPageTable<T>,
  slug: string
): [FunctionComponent, ({ el }: { el: T }) => JSX.Element] => {
  const TableContainer: FunctionComponent = ({ children }) => (
    <div class="dataview-table-container">
      <table class="dataview-table-content">
        <thead>
          <tr>
            <th>Name</th>
            {table.head.map((h) => (
              <th>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );

  const TableRenderComponent: ({ el }: { el: T }) => JSX.Element = ({ el }) => (
    <tr>
      <td>
        <Link href={`/${slug}/${el.slug}`}>{el.name}</Link>
      </td>
      {table.row.map((p) => (
        <td>{String(el[p as keyof T])}</td>
      ))}
    </tr>
  );

  return [TableContainer, TableRenderComponent];
};
