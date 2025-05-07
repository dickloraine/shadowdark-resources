import type { JSX } from 'preact';

export const getSlug = (name: string) =>
  name.toLowerCase().replace(', ', '-').replace(' ', '-');

export const blurOnReturn = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
  if (e.code === 'Enter') {
    e.currentTarget.blur();
  }
};
