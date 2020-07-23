import React from "react";
import Router from "./Router";
import { Provider } from "react-redux";
import store from "./redux";
import {
  IntrospectionFragmentMatcher,
  InMemoryCache,
  ApolloClient,
} from "apollo-boost";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { ApolloProvider } from "@apollo/react-hooks";
import { ToastContainer, Slide } from "react-toastify";
import { hot } from "react-hot-loader/root";
import "react-toastify/dist/ReactToastify.css";
import "suneditor/dist/css/suneditor.min.css"; // Import Sun Editor's CSS File
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/app.scss";
import fragmentTypes from "./generated/fragmentTypes.json";
import { APP_GRAPHQL_URL } from "./settings";

const graphqlUri = APP_GRAPHQL_URL;
const httpLink = createHttpLink({ uri: graphqlUri });
const authLink = setContext((_, { headers }) => {
  const token = localStorage.token;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: fragmentTypes,
});

const cache = new InMemoryCache({ fragmentMatcher });

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Router />
        <ToastContainer
          hideProgressBar
          autoClose={1700}
          position="top-right"
          transition={Slide}
          toastClassName="mt-3"
        />
      </ApolloProvider>
    </Provider>
  );
};

export default hot(App);
