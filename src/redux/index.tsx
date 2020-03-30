import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import auth from "./auth";
import dialogBoxReducer from "./dialogBox";

const rootReducer = combineReducers({
  auth,
  dialogBox: dialogBoxReducer
});

const store = createStore(rootReducer, applyMiddleware(logger));

export default store;

export type RootState = ReturnType<typeof rootReducer>;
