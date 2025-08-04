import React, { createContext, useMemo, useLayoutEffect, useReducer, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserState = { [key: string]: unknown } | null;

type UserAction =
  | { type: 'SET_USER'; payload: UserState }
  | { type: 'RESET_USER' };

interface IUserContext {
  user: UserState;
  updateUser: (u: UserState) => void;
  resetUser: () => void;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  updateUser: () => {},
  resetUser: () => {},
});

type Props = { children: ReactNode };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'RESET_USER':
      return null;
    default:
      return state;
  }
}

export function UserProvider({ children }: Props) {
  const [user, dispatch] = useReducer(userReducer, null);

  useLayoutEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem('currentUser')
      .then(data => {
        if (data && isMounted) dispatch({ type: 'SET_USER', payload: JSON.parse(data) });
      })
      .catch(e => {
        if (__DEV__) console.warn('User load failed', e);
      });
    return () => { isMounted = false; };
  }, []);

  const updateUser = (u: UserState) => dispatch({ type: 'SET_USER', payload: u });
  const resetUser = () => dispatch({ type: 'RESET_USER' });

  const contextValue = useMemo(() => ({
    user,
    updateUser,
    resetUser,
  }), [user]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
