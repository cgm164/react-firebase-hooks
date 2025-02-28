import firebase from 'firebase/compat/app';
import { useEffect, useMemo } from 'react';
import { snapshotToData, ValOptions } from './helpers';
import { ObjectHook, ObjectValHook, Val } from './types';
import { useIsEqualRef, useLoadingValue } from '../util';

export const useObject = (
  query?: firebase.database.Query | null
): ObjectHook => {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    firebase.database.DataSnapshot,
    firebase.FirebaseError
  >();
  const ref = useIsEqualRef(query, reset);

  useEffect(() => {
    const query = ref.current;
    if (!query) {
      setValue(undefined);
      return;
    }

    query.on('value', setValue, setError);

    return () => {
      query.off('value', setValue);
    };
  }, [ref.current]);

  const resArray: ObjectHook = [value, loading, error];
  return useMemo(() => resArray, resArray);
};

export const useObjectVal = <
  T,
  KeyField extends string = '',
  RefField extends string = ''
>(
  query?: firebase.database.Query | null,
  options?: ValOptions<T>
): ObjectValHook<T, KeyField, RefField> => {
  const keyField = options ? options.keyField : undefined;
  const refField = options ? options.refField : undefined;
  const transform = options ? options.transform : undefined;
  const [snapshot, loading, error] = useObject(query);
  const value = useMemo(
    () =>
      (snapshot
        ? snapshotToData(snapshot, keyField, refField, transform)
        : undefined) as Val<T, KeyField, RefField>,
    [snapshot, keyField, refField, transform]
  );

  const resArray: ObjectValHook<T, KeyField, RefField> = [
    value,
    loading,
    error,
  ];
  return useMemo(() => resArray, resArray);
};
