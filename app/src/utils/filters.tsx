import type { FilterPredicate } from '@/components/DataView';

export const filter_string: FilterPredicate = (el, attr, target) => {
  if (!(attr in el)) return false;
  const test = el[attr].toLowerCase();
  return test.includes(target.toLowerCase());
};

export const filter_range: FilterPredicate = (el, attr, target) => {
  const test = el[attr];
  if (target === '') {
    return true;
  } else if (target.includes('+')) {
    return test >= target.split('+')[0];
  } else if (target.includes('-')) {
    let [lower, upper] = target.split('-');
    if (upper) {
      return test >= lower && test <= upper;
    } else {
      return test <= lower;
    }
  }
  return test == target;
};

export const filter_select: FilterPredicate = (el, attr, target) => {
  if (target === 'Any') {
    return true;
  }
  return el[attr].includes(target);
};

export const filter_select_for_property: FilterPredicate = (el, _, target) => {
  if (target === 'Any') {
    return true;
  } else if (target.slice(0, 1) === '!') {
    return !el[target.slice(1)];
  }
  return !!el[target];
};

export const sortFunction = (sortBy: string, sortAscending: boolean) => {
  return (a: any, b: any) => {
    if (!(sortBy in a) || !(sortBy in b)) {
      return 0;
    }
    if (typeof a[sortBy] === 'number') {
      return sortAscending ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    }
    a = a[sortBy].toString().toLowerCase();
    b = b[sortBy].toString().toLowerCase();
    if (!sortAscending) {
      [a, b] = [b, a];
    }
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
};
