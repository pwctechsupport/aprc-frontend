import React from "react";
import Router from "./Router";
import { Provider } from "react-redux";
import store from "./redux";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

const client = new ApolloClient({
  uri: "http://mandalorian.rubyh.co/graphql"
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Router />
      </ApolloProvider>
    </Provider>
  );
};

export default App;
