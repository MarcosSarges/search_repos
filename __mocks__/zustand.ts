import { act } from '@testing-library/react-native';
import type * as ZustandExportedTypes from 'zustand';

const actualZustand = jest.requireActual<typeof ZustandExportedTypes>('zustand');

/** Reset functions for every store created under the Jest mock. */
export const storeResetFns = new Set<() => void>();

const createUncurried = <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualZustand.create(stateCreator);
  const initialState = store.getInitialState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

export const create = (<T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  return typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried;
}) as typeof ZustandExportedTypes.create;

const createStoreUncurried = <T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  const store = actualZustand.createStore(stateCreator);
  const initialState = store.getInitialState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

export const createStore = (<T>(stateCreator: ZustandExportedTypes.StateCreator<T>) => {
  return typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried;
}) as typeof ZustandExportedTypes.createStore;

export const useStore = actualZustand.useStore;

afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn();
    });
  });
});
