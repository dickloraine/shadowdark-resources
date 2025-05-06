export const getSlug = (name: string) =>
  name.toLowerCase().replace(', ', '-').replace(' ', '-');
