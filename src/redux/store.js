import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import dataReducer from "./reducer";
import ACTIONS from "./actions";

export function configureStore() {
  const store = createStore(dataReducer, applyMiddleware(thunk));
  store.dispatch(ACTIONS.verifyAuth());
  return store;
}
