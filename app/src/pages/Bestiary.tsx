import bestiary_data from '@/assets/bestiary_data.json';
import { ShadowdarkDataPage } from '@/components/ShadowdarkDataPage';
import { filter_range, filter_select, filter_string } from '@/utils/filters';
import { Link } from 'wouter-preact';

interface Monster {
  name: string;
  description: string;
  level: number;
  alignment: string;
  ac: number;
  hp: number;
  armor_type: string;
  movement: string;
  attack: string;
  stats: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  actions: {
    name: string;
    description: string;
  }[];
  image?: string;
  slug: string;
  source: string;
}

export const Bestiary = () => (
  <ShadowdarkDataPage
    name="Bestiary"
    data={bestiary_data as Monster[]}
    RenderComponent={Monster}
    sortOptions={[
      { name: 'name', label: 'Name' },
      { name: 'level', label: 'Level' },
      { name: 'ac', label: 'Armor Class' },
      { name: 'hp', label: 'Hit Points' },
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
        name: 'filterByLevel',
        key: 'level',
        value: '',
        label: 'Filter by level',
        function: filter_range,
      },
      {
        name: 'filterByAlignment',
        key: 'alignment',
        value: 'Any',
        label: 'Filter by alignment',
        function: filter_select,
        options: [
          { name: 'Any', label: 'Any' },
          { name: 'Lawful', label: 'Lawful' },
          { name: 'Neutral', label: 'Neutral' },
          { name: 'Chaotic', label: 'Chaotic' },
        ],
      },
    ]}
    table={{
      head: ['Level', 'Alignment', 'AC', 'HP'],
      row: ['level', 'alignment', 'ac', 'hp'],
    }}
    hasImages={true}
  />
);

const Monster = ({ el }: { el: Monster }) => {
  return (
    <div class="dataview-entry dataview-entry-monster">
      <h2 id={el.name}>
        <Link href={`/bestiary/${el.slug}`}>{el.name.toUpperCase()}</Link>
      </h2>
      <div class={`dataview-entry-container monster-container`}>
        {el.image ? <img src={el.image} alt={el.name} /> : null}
        <div class="monster-content">
          <p dangerouslySetInnerHTML={{ __html: `<em>${el.description}</em>` }} />
          <p>
            <strong>LV</strong> {el.level}, <strong>AL</strong> {el.alignment[0]}
            <br />
            <strong>AC</strong> {el.ac}
            {el.armor_type ? ` (${el.armor_type})` : null}, <strong>HP </strong>
            {el.hp}, <strong>MV </strong> {el.movement}
            <br />
            <strong>ATK</strong> {el.attack}
          </p>
          <table>
            <thead>
              <tr>
                <th>Str</th>
                <th>Dex</th>
                <th>Con</th>
                <th>Int</th>
                <th>Wis</th>
                <th>Cha</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{el.stats.str}</td>
                <td>{el.stats.dex}</td>
                <td>{el.stats.con}</td>
                <td>{el.stats.int}</td>
                <td>{el.stats.wis}</td>
                <td>{el.stats.cha}</td>
              </tr>
            </tbody>
          </table>
          <div class="monster-actions">
            {el.actions.map((action) => (
              <dl>
                <dt>{`${action.name}.`}</dt>
                <dd
                  dangerouslySetInnerHTML={{
                    __html: action.description,
                  }}
                />
              </dl>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
