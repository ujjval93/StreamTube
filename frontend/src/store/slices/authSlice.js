import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    accessToken: localStorage.getItem("accessToken") || null,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    isLoading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            if (user) {
                state.user = user;
                localStorage.setItem("user", JSON.stringify(user));
            }
            if (accessToken) {
                state.accessToken = accessToken;
                localStorage.setItem("accessToken", accessToken);
            }
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem("user", JSON.stringify(state.user));
        },
    },
});

export const { setCredentials, logout, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;