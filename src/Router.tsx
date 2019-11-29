import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ScrollToTop from "./shared/components/ScrollToTop";
import Homepage from "./containers/homepage/Homepage";

const AuthPage = () => <h1>Auth bro!</h1>;

export default function() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Switch>
          <Route exact path="/" component={Homepage} />
          <Route path="/auth" component={AuthPage} />
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
