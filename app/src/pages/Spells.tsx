import spell_data from '@/assets/spell_data.json';
import { ShadowdarkDataPage } from '@/components/ShadowdarkDataPage';
import { filter_range, filter_select, filter_string } from '@/utils/filters';
import { Link } from 'wouter-preact';

interface Spell {
  name: string;
  description: string;
  tier: number;
  dc: number;
  classes: string[];
  duration: string;
  range: string;
  slug: string;
  source: string;
}

export const Spells = () => (
  <ShadowdarkDataPage
    name="Spells"
    data={spell_data as Spell[]}
    RenderComponent={Spell}
    sortOptions={[
      { name: 'name', label: 'Name' },
      { name: 'tier', label: 'Tier' },
      { name: 'classes', label: 'Class' },
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
        name: 'filterByTier',
        key: 'tier',
        value: '',
        label: 'Filter by tier',
        function: filter_range,
      },
      {
        name: 'filterByClass',
        key: 'classes',
        value: 'Any',
        label: 'Filter by class',
        function: filter_select,
        options: [
          { name: 'Any', label: 'Any' },
          { name: 'priest', label: 'Priest' },
          { name: 'wizard', label: 'Wizard' },
        ],
      },
    ]}
    table={{
      head: ['Tier', 'Duration', 'Range'],
      row: ['tier', 'duration', 'range'],
    }}
    startWithLayout="twocolumns"
  />
);

const Spell = ({ el }: { el: Spell }) => {
  return (
    <div class="dataview-entry dataview-entry-spell">
      <h2 id={el.name}>
        <Link href={`/spells/${el.slug}`}>{el.name.toUpperCase()}</Link>
      </h2>
      <div class="dataview-entry-container spell-container">
        <div class="spell-content">
          <p>
            <em>
              Tier {el.tier}, {el.classes.join(', ')}
            </em>
          </p>
          <p>
            <strong>Duration:</strong> {el.duration}
          </p>
          <p>
            <strong>Range:</strong> {el.range}
          </p>
          <p dangerouslySetInnerHTML={{ __html: el.description }} />
        </div>
      </div>
    </div>
  );
};
