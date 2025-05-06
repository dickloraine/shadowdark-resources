import { JSX } from 'preact/jsx-runtime';
import { NamedData } from './DataView';

type SingleDataPageElementProps<T extends NamedData> = {
  elementName: string;
  data: T[];
  name: string;
  slug: string;
  RenderComponent: ({ el }: { el: T }) => JSX.Element;
  style?: string;
};

export const SingleDataPageElement = <T extends NamedData>({
  elementName,
  data,
  name,
  slug,
  RenderComponent,
  style = '',
}: SingleDataPageElementProps<T>) => {
  const el = data.find((el) => el.slug === elementName);
  if (!el) {
    return <div>Element does not exist!</div>;
  }
  return (
    <div class={style}>
      <div class={`dataview dataview-${slug}`}>
        <h1 id={slug}>{name}</h1>
        <div class={`dataview-content ${slug}-content`}>
          <RenderComponent el={el} />
        </div>
      </div>
    </div>
  );
};
