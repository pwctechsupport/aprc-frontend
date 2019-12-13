import React from "react";
import { Route, Switch } from "react-router";
// import Policies from "./Policies";
// import Policy from "./Policy";
// import CreatePolicy from "./CreatePolicy";
// import CreateSubPolicy from "./CreateSubPolicy";
// import PolicySideBox from "./components/PolicySideBox";

const PolicyRoute = () => {
  return (
    <div className="d-flex">
      <div>
        <Route path="/risk" component={RiskSideBox} />
      </div>
      <div className="w-100 ml-3">
        <Route exact path="/risks" component={Risks} />
        <Switch>
          <Route exact path="/risk/create" component={CreateRisk} />
          <Route exact path="/risk/:id" component={Risk} />
        </Switch>
      </div>
    </div>
  );
};

export default PolicyRoute;
