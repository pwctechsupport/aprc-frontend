import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ForgotPassword from "./containers/auth/ForgotPassword";
import Login from "./containers/auth/Login";
import ResetPassword from "./containers/auth/ResetPassword";
import Bookmark from "./containers/bookmark/Bookmark";
import BusinessProcessRoute from "./containers/businessProcess/BusinessProcessRoute";
import ControlRoute from "./containers/control/ControlRoute";
import Homepage from "./containers/homepage/Homepage";
import Notification from "./containers/notification/Notification";
import PolicyRoute from "./containers/policy/PolicyRoute";
import ReferenceRoute from "./containers/referencess/ReferenceRoute";
import Report from "./containers/report/Report";
import ResourceRoute from "./containers/resources/ResourceRoute";
import RiskRoute from "./containers/risk/RiskRoute";
import RiskAndControlRoute from "./containers/riskAndControl/RiskAndControlRoute";
import SettingsRoute from "./containers/settings/SettingsRoute";
import UserRoute from "./containers/user/UserRoute";
import AuthListener from "./shared/components/AuthListener";
import AuthRoute from "./shared/components/AuthRoute";
import ComingSoonPage from "./shared/components/ComingSoonPage";
import Layout from "./shared/components/Layout";
import ScrollToTop from "./shared/components/ScrollToTop";
import PolicyCategoryRoute from "./containers/policyCategory/PolicyCategoryRoute";

export default function() {
  return (
    <BrowserRouter>
      {/* <BookmarksModal /> */}
      <Route component={AuthListener} />
      <ScrollToTop>
        <Switch>
          <Route exact path="/auth" component={Login} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route exact path="/users/password/edit" component={ResetPassword} />

          <Layout>
            <AuthRoute exact path="/" component={Homepage} />
            <Switch>
              <AuthRoute path="/policy" component={PolicyRoute} />
              <AuthRoute
                path="/policy-category"
                component={PolicyCategoryRoute}
              />
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
              <AuthRoute path="/control" component={ControlRoute} />
              <AuthRoute path="/user" component={UserRoute} />
              <AuthRoute path="/bookmark" component={Bookmark} />
              <AuthRoute path="/notifications" component={Notification} />

              <AuthRoute path="/settings" component={SettingsRoute} />

              <AuthRoute path="/references" component={ReferenceRoute} />
              <AuthRoute component={ComingSoonPage} />
            </Switch>
          </Layout>
        </Switch>
      </ScrollToTop>
    </BrowserRouter>
  );
}
