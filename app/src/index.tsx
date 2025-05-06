import { FunctionComponent, render } from 'preact';
import { Redirect, Route, Router } from 'wouter-preact';
import { useHashLocation } from 'wouter-preact/use-hash-location';

import { Appbar } from '@/components/Appbar';
import { Banner } from '@/components/Banner';
import { About } from '@/pages/About';
import { Bestiary } from '@/pages/Bestiary';
import { Items } from '@/pages/Items';
import { Spells } from '@/pages/Spells';

import './style.css';

export type Page = { title: string; route: string; component: FunctionComponent };

const pages: Page[] = [
  { title: 'About', route: '/about', component: About },
  { title: 'Bestiary', route: '/bestiary', component: Bestiary },
  { title: 'Spells', route: '/spells', component: Spells },
  { title: 'Magic Items', route: '/magic-items', component: Items },
];

const App = () => {
  return (
    <div class="app">
      <Banner>Shadowdark Resources</Banner>
      <Appbar pages={pages} />
      <Router hook={useHashLocation}>
        {pages.map((page) => (
          <page.component />
        ))}
        <Route path="/">
          <Redirect to={pages[0].route} />
        </Route>
      </Router>
    </div>
  );
};

const rootElement = document.getElementById('app');
if (rootElement) {
  render(<App />, rootElement);
} else {
  console.error("Root element with id 'app' not found.");
}
