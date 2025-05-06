import item_data from '@/assets/item_data.json';
import { ShadowdarkDataPage } from '@/components/ShadowdarkDataPage';
import {
  filter_select,
  filter_select_for_property,
  filter_string,
} from '@/utils/filters';
import { Link } from 'wouter-preact';

interface Item {
  name: string;
  description: string;
  item_type: string;
  slug: string;
  Benefit: string;
  Curse?: string;
  Bonus?: string;
  Personality?: string;
}

export const Items = () => (
  <ShadowdarkDataPage
    name="Magic Items"
    data={item_data as Item[]}
    RenderComponent={Item}
    sortOptions={[
      { name: 'name', label: 'Name' },
      { name: 'item_type', label: 'Type' },
    ]}
    filterOptions={[
      {
        name: 'filterByName',
        key: 'name',
        value: '',
        label: 'Filter by name',
        function: filter_string,
      },
      {
        name: 'filterByType',
        key: 'item_type',
        value: 'Any',
        label: 'Filter by type',
        function: filter_select,
        options: [
          { name: 'Any', label: 'Any' },
          { name: 'Armor', label: 'Armor' },
          { name: 'Jewelry', label: 'Jewelry' },
          { name: 'Potion', label: 'Potion' },
          { name: 'Wand', label: 'Wand/Staff' },
          { name: 'Weapon', label: 'Weapon' },
          { name: 'Wondrous Item', label: 'Wondrous Item' },
        ],
      },
      {
        name: 'filterByEffect',
        key: '',
        value: 'Any',
        label: 'Filter by effect',
        function: filter_select_for_property,
        options: [
          { name: 'Any', label: 'Any' },
          { name: 'Bonus', label: 'Bonus' },
          { name: 'Curse', label: 'Curse' },
          { name: '!Curse', label: 'Not cursed' },
          { name: 'Personality', label: 'Personality' },
        ],
      },
    ]}
    table={{
      head: ['Type'],
      row: ['item_type'],
    }}
    startWithLayout="twocolumns"
  />
);

const Item = ({ el }: { el: Item }) => {
  const effects = Object.entries(el).filter(
    ([k, v]) => k !== 'name' && k !== 'description' && k !== 'item_type'
  );
  return (
    <div class="dataview-entry dataview-entry-item">
      <h2 id={el.name}>
        <Link href={`/magic-items/${el.slug}`}>{el.name.toUpperCase()}</Link>
      </h2>
      <div class="dataview-entry-container item-container">
        <div class="item-content">
          <p dangerouslySetInnerHTML={{ __html: `<em>${el.description}</em>` }} />
          {effects.map(([k, v]) => (
            <dl>
              <dt>{`${k}.`}</dt>
              <dd
                dangerouslySetInnerHTML={{
                  __html: v,
                }}
              />
            </dl>
          ))}
        </div>
      </div>
    </div>
  );
};
