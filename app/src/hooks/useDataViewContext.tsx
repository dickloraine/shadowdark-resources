import { DataViewContext } from '@/hooks/useDataViewContextProvider';
import { useContext } from 'preact/hooks';

/**
 * Custom hook to access the `DataViewContext` state.
 *
 * This hook retrieves the current value of the `DataViewContext`. If the context
 * is not provided, it will throw an error to ensure that the hook is used within
 * a valid `DataViewContext.Provider`.
 *
 * @throws {Error} If the `DataViewContext` is not provided.
 * @returns {T} The current state of the `DataViewContext`.
 */
export const useDataViewContext = () => {
  const dataViewState = useContext(DataViewContext);
  if (!dataViewState) {
    throw new Error('DataView context not provided!');
  }
  return dataViewState;
};
