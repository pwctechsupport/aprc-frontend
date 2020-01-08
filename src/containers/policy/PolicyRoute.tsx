import React from "react";
import { Route, Switch } from "react-router";
import Policies from "./Policies";
import Policy from "./Policy";
import CreatePolicy from "./CreatePolicy";
import CreateSubPolicy from "./CreateSubPolicy";
import PolicySideBox from "./components/PolicySideBox";

const PolicyRoute = () => {
  return (
    <Switch>
      <Route exact path="/policy" component={Policies} />
      <div className="d-flex">
        <Route path="/policy" component={PolicySideBox} />
        <div className="w-100 ml-3">
          <Switch>
            <Route
              exact
              path="/policy/:id/create-sub-policy"
              component={CreateSubPolicy}
            />
            <Route exact path="/policy/create" component={CreatePolicy} />
            <Route exact path="/policy/:id" component={Policy} />
          </Switch>
        </div>
      </div>
    </Switch>
  );
};

export default PolicyRoute;
