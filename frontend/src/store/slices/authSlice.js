import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUserProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!resp.ok) {
        if (resp.status === 401) return null;
        throw new Error("Failed to fetch profile");
      }
      const userData = await resp.json();
      return userData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  await fetch(`${API_BASE_URL}/api/auth/logout`, { credentials: "include" });
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default authSlice.reducer;
