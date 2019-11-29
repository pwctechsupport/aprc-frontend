import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import auth from "./auth";

const rootReducer = combineReducers({
  auth: auth
});

const store = createStore(rootReducer, applyMiddleware(logger));

export default store;
