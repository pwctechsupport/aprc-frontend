import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ScrollToTop from "./shared/components/ScrollToTop";
import Homepage from "./containers/homepage/Homepage";
import AuthRoute from "./shared/components/AuthRoute";
import Login from "./containers/auth/Login";
import AuthListener from "./shared/components/AuthListener";
import Navbar from "./shared/components/Navbar";

export default function() {
  return (
    <BrowserRouter>
      <Route component={AuthListener} />
      <Route path="/" component={Navbar} />
      <ScrollToTop>
        <Switch>
          <Route path="/auth" component={Login} />
          <AuthRoute exact path="/" component={Homepage} />
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
