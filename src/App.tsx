import React from "react";
import Router from "./Router";
import { Provider } from "react-redux";
import store from "./redux";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hot } from "react-hot-loader/root";

const client = new ApolloClient({
  uri: "http://mandalorian.rubyh.co/graphql",
  headers: {
    Authorization: localStorage.userToken
      ? `Bearer ${localStorage.userToken}`
      : undefined
  }
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
