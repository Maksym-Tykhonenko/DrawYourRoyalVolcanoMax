import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserShape = Record<string, any>;

const defaultUser: UserShape = {};

export const persistUser = createAsyncThunk<void, UserShape>(
  'user/persistUser',
  async (user, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.warn('User save error:', error);
      return rejectWithValue(error);
    }
  }
);

export const retrieveUser = createAsyncThunk<UserShape>(
  'user/retrieveUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await AsyncStorage.getItem('currentUser');
      return data ? JSON.parse(data) : defaultUser;
    } catch (error) {
      console.warn('User load error:', error);
      return rejectWithValue(defaultUser);
    }
  }
);

const userSlice = createSlice({
  name: 'userData',
  initialState: defaultUser,
  reducers: {
    overwriteUser: (state, action: PayloadAction<UserShape>) => {
      return { ...action.payload };
    },
    patchUser: (state, action: PayloadAction<UserShape>) => {
      Object.assign(state, action.payload);
    },
    clearUser: () => defaultUser,
  },
  extraReducers: (builder) => {
    builder.addCase(retrieveUser.fulfilled, (state, action) => {
      return { ...action.payload };
    });
  },
});

export const { overwriteUser, patchUser, clearUser } = userSlice.actions;
export { retrieveUser as loadUserData, persistUser as saveUser };
export default userSlice.reducer;
