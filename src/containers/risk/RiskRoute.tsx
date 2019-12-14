import React from "react";
import { Route, Switch } from "react-router";
import Risks from "./Risks";
import CreateRisk from "./CreateRisk";
import Risk from "./Risk";
import RiskSideBox from "./components/RiskSideBox";
// import Policy from "./Policy";
// import CreatePolicy from "./CreatePolicy";
// import CreateSubPolicy from "./CreateSubPolicy";
// import PolicySideBox from "./components/PolicySideBox";

const RiskRoute = () => {
  return (
    <div className="d-flex">
      <div>
        <Route path="/admin/risk" component={RiskSideBox} />
      </div>
      <div className="w-100 ml-3">
        <Route exact path="/admin/risk" component={Risks} />
        <Switch>
          <Route exact path="/admin/risk/create" component={CreateRisk} />
          <Route exact path="/admin/risk/:id" component={Risk} />
        </Switch>
      </div>
    </div>
  );
};

export default RiskRoute;
