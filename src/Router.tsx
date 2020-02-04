import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Login from "./containers/auth/Login";
import BusinessProcessRoute from "./containers/businessProcess/BusinessProcessRoute";
import Control from "./containers/control/Control";
import Controls from "./containers/control/Controls";
import CreateControl from "./containers/control/CreateControl";
import Homepage from "./containers/homepage/Homepage";
import BookmarksModal from "./containers/policy/components/BookmarksModal";
import PolicyRoute from "./containers/policy/PolicyRoute";
import References from "./containers/referencess/References";
import Report from "./containers/report/Report";
import ResourceRoute from "./containers/resources/ResourceRoute";
import RiskRoute from "./containers/risk/RiskRoute";
import RiskAndControlRoute from "./containers/riskAndControl/RiskAndControlRoute";
import AuthListener from "./shared/components/AuthListener";
import AuthRoute from "./shared/components/AuthRoute";
import ForgotPassword from "./containers/auth/ForgotPassword";
import ComingSoonPage from "./shared/components/ComingSoonPage";
import Layout from "./shared/components/Layout";
import ScrollToTop from "./shared/components/ScrollToTop";
import ResetPassword from "./containers/auth/ResetPassword";

export default function() {
  return (
    <BrowserRouter>
      <BookmarksModal />
      <Route component={AuthListener} />
      <ScrollToTop>
        <Switch>
          <Route exact path="/auth" component={Login} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route
            exact
            path="/users/password/edit"
            component={ResetPassword}
          />

          <Layout>
            <AuthRoute exact path="/" component={Homepage} />
            <Switch>
              <AuthRoute path="/policy" component={PolicyRoute} />
              <AuthRoute path="/resources" component={ResourceRoute} />
              <AuthRoute path="/risk" component={RiskRoute} />
              <AuthRoute
                path="/business-process"
                component={BusinessProcessRoute}
              />
              <AuthRoute
                path="/risk-and-control"
                component={RiskAndControlRoute}
              />
              <AuthRoute path="/report" component={Report} />
              <AuthRoute exact path="/references" component={References} />
              <AuthRoute exact path="/control" component={Controls} />
              <AuthRoute
                exact
                path="/control/create"
                component={CreateControl}
              />
              <AuthRoute exact path="/control/:id" component={Control} />

              <AuthRoute component={ComingSoonPage} />
            </Switch>
          </Layout>
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  )
}
