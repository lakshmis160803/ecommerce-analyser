import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  loginUser,
  getMe,
} from "../services/authService";

// LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await loginUser(
        userData
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  }
);

// CHECK USER FROM COOKIE
export const fetchUser =
  createAsyncThunk(
    "auth/fetchUser",
    async (_, thunkAPI) => {
      try {
        const response = await getMe();

        return response.data.user;
      } catch (error) {
        return thunkAPI.rejectWithValue(
          null
        );
      }
    }
  );

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // was false
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        login.fulfilled,
        (state, action) => {
          state.loading = false;
          state.user =
            action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      )

      .addCase(
        login.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
          state.isAuthenticated = false;
        }
      )
.addCase(
  fetchUser.pending,
  (state) => {
    state.loading = true;
  }
)
      .addCase(
  fetchUser.fulfilled,
  (state, action) => {
    state.user = action.payload;
    state.isAuthenticated = true;
    state.loading = false;
  }
)

      .addCase(
  fetchUser.rejected,
  (state) => {
    state.user = null;
    state.isAuthenticated = false;
    state.loading = false;
  }
)
  },
});

export const { logout } =
  authSlice.actions;

export default authSlice.reducer;