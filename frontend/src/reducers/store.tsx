import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer";

export const store = configureStore({
  reducer,
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       ignoredActions: [
  //         "@snackbar/SNACKBAR_OPEN",
  //       ],
  //     },
  //   }),
});

export type AppDispatch = typeof store.dispatch;
