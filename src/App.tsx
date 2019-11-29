import React from "react";
import Router from "./Router";
import { Provider } from "react-redux";
import store from "./redux";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
};

export default App;
