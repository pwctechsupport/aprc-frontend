import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import auth from "./auth";
import modal from "./modal";

const rootReducer = combineReducers({
  auth,
  modal
});

const store = createStore(rootReducer, applyMiddleware(logger));

export default store;

export type RootState = ReturnType<typeof rootReducer>;
