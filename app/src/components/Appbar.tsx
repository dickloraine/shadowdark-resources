import type { Page } from '@/index';
import { useHashLocation } from 'wouter-preact/use-hash-location';

export const Appbar = ({ pages }: { pages: Page[] }) => {
  return (
    <div class="appbar">
      {pages.map((page) => (
        <AppbarItem page={page} />
      ))}
    </div>
  );
};

export const AppbarItem = ({ page }: { page: Page }) => {
  const [location, navigate] = useHashLocation();

  const handleClick = () => {
    navigate(page.route);
  };

  return (
    <button
      class={`appbar-item ${location.includes(page.route) && 'appbar-item-active'}`}
      onClick={handleClick}
    >
      {page.title}
    </button>
  );
};
