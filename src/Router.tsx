import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./containers/auth/Login";
import BusinessProcess from "./containers/businessProcess/BusinessProcess";
import BusinessProcesses from "./containers/businessProcess/BusinessProcesses";
import CreateBusinessProcess from "./containers/businessProcess/CreateBusinessProcess";
import Control from "./containers/control/Control";
import Controls from "./containers/control/Controls";
import CreateControl from "./containers/control/CreateControl";
import Homepage from "./containers/homepage/Homepage";
import PolicyRoute from "./containers/policy/PolicyRoute";
import References from "./containers/referencess/References";
import ResourceRoute from "./containers/resources/ResourceRoute";
import RiskRoute from "./containers/risk/RiskRoute";
import AuthListener from "./shared/components/AuthListener";
import AuthRoute from "./shared/components/AuthRoute";
import Layout from "./shared/components/Layout";
import ScrollToTop from "./shared/components/ScrollToTop";
import BookmarksModal from "./containers/policy/components/BookmarksModal";

export default function() {
  return (
    <BrowserRouter>
      <BookmarksModal />
      <Route component={AuthListener} />
      <ScrollToTop>
        <Switch>
          <Route path="/auth" component={Login} />

          <Layout>
            <AuthRoute exact path="/" component={Homepage} />
            <Switch>
              <AuthRoute
                exact
                path="/business-process"
                component={BusinessProcesses}
              />
              <AuthRoute
                exact
                path="/business-process/create"
                component={CreateBusinessProcess}
              />
              <AuthRoute
                exact
                path="/business-process/:id"
                component={BusinessProcess}
              />
              <AuthRoute
                exact
                path="/business-process/:id"
                component={BusinessProcess}
              />
              <AuthRoute exact path="/references" component={References} />

              <AuthRoute exact path="/control" component={Controls} />
              <AuthRoute
                exact
                path="/control/create"
                component={CreateControl}
              />
              <AuthRoute exact path="/control/:id" component={Control} />
              <AuthRoute path="/policy" component={PolicyRoute} />
              <AuthRoute path="/resources" component={ResourceRoute} />
              <AuthRoute path="/risk" component={RiskRoute} />
            </Switch>
          </Layout>
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
