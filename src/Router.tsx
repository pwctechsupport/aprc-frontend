import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ScrollToTop from "./shared/components/ScrollToTop";
import Homepage from "./containers/homepage/Homepage";
import AuthRoute from "./shared/components/AuthRoute";
import Login from "./containers/auth/Login";
import AuthListener from "./shared/components/AuthListener";
import Layout from "./shared/components/Layout";
import Policies from "./containers/policy/Policies";
import CreatePolicy from "./containers/policy/CreatePolicy";
import Policy from "./containers/policy/Policy";

export default function() {
  return (
    <BrowserRouter>
      <Route component={AuthListener} />
      <ScrollToTop>
        <Switch>
          <Route path="/auth" component={Login} />

          <Layout>
            <AuthRoute exact path="/" component={Homepage} />
            <Switch>
              <AuthRoute exact path="/policy" component={Policies} />
              <AuthRoute exact path="/policy/create" component={CreatePolicy} />
              <AuthRoute exact path="/policy/:id" component={Policy} />
            </Switch>
          </Layout>
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
