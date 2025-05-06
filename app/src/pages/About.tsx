import { useRoute } from 'wouter-preact';

export const About = () => {
  const [match] = useRoute(`/about`);
  if (!match) return null;
  return (
    <div class="about">
      <div class="about-content">
        <h1 id="About">About</h1>
        <p>
          This is a collection of material for Shadowdark that is licensed free to use
          under the Shadowdark License. For now this includes the core monsters, spells
          and items.
        </p>
        <p>
          You can find the source code, a standalone version and the informations
          presented here in different formats in{' '}
          <a href="https://www.github.com/">this github repository</a>.
        </p>

        <h2>Usage</h2>
        <p>
          Each page has a filter menu at the top with various options to filter and sort
          the data. With the rightmost button in this menu you can toggle the display
          between a single column, two columns and a table view of the data. The button
          to its left on the bestiary page lets you toggle between showing and hiding
          the images.
          <br />
          Clicking on the name of an entry opens its page.
        </p>

        <h2>Acknowledgements</h2>
        <p>
          <strong>
            <a href="https://www.thearcanelibrary.com/">The Arcane Library</a>
          </strong>{' '}
          for creating Shadowdark and releasing this material free to use.
        </p>

        <p>
          <strong>
            <a href="https://github.com/PrototypeESBU/foundryvtt-shadowdark-community-tokens">
              Shadowdark RPG Community Tokens
            </a>
          </strong>{' '}
          for creating and collecting the monster images.
        </p>

        <p>
          <strong>All images are AI generated.</strong>
        </p>

        <h2>Legal</h2>

        <h3>Fonts</h3>
        <p>
          JSL Blackletter font © 2023 Jeffrey S. Lee.
          <br />
          Old Newspaper Types font © 2023 Manfred Klein.
          <br />
          Montserrat font family © 2023 Julieta Ulanovsky, Sol Matas, Juan Pablo del
          Peral, Jacques Le Bailly.
        </p>

        <h3>Legal Information and Attribution Statement</h3>
        <p>
          This work is an independent product published under the Shadowdark RPG
          Third-Party License and is not affiliated with The Arcane Library, LLC.
          Shadowdark RPG © 2023 The Arcane Library, LLC.
        </p>
        <p>
          This work includes material taken from the System Reference Document 5.1 (“SRD
          5.1”) by Wizards of the Coast LLC and available at{' '}
          <a href="https://dnd.wizards.com/resources/systems-reference-document">
            https://dnd.wizards.com/resources/systems-reference-document
          </a>
          . The SRD 5.1 is licensed under the Creative Commons Attribution 4.0
          International License available at{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/legalcode">
            https://creativecommons.org/licenses/by/4.0/legalcode
          </a>
          .
        </p>
      </div>
    </div>
  );
};
