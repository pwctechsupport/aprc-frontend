import React from "react";
import { Route, Switch } from "react-router";
import Policies from "./Policies";
import Policy from "./Policy";
import CreatePolicy from "./CreatePolicy";
import CreateSubPolicy from "./CreateSubPolicy";
import PolicySideBox from "./components/PolicySideBox";
import PolicyDashboard from "./PolicyDashboard";

const PolicyRoute = () => {
  return (
    <div className="d-flex">
      <div>
        <Route path="/policy" component={PolicySideBox} />
      </div>
      <div className="w-100 ml-3">
        <Route exact path="/policy" component={PolicyDashboard} />
        <Route exact path="/policy/all" component={Policies} />
        <Route
          exact
          path="/policy/:id/create-sub-policy"
          component={CreateSubPolicy}
        />
        <Switch>
          <Route exact path="/policy/create" component={CreatePolicy} />
          <Route exact path="/policy/:id" component={Policy} />
        </Switch>
      </div>
    </div>
  );
};

export default PolicyRoute;
