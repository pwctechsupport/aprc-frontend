import React from "react";
import { Route, Switch } from "react-router-dom";
import RiskAndControl from "./RiskAndControl";
import RiskAndControlSideBox from "./RiskAndControlSideBox";
import EmptyData from "./EmptyData";
import RiskAndControls from "./RiskAndControls";

const RiskAndControlRoute = () => {
  return (
    <Switch>
      <Route exact path="/risk-and-control" component={RiskAndControls} />
      <Route component={RestOfRiskAndControl} />
    </Switch>
  );
};

const RestOfRiskAndControl = () => (
  <div className="d-flex">
    <Route path="/risk-and-control" component={RiskAndControlSideBox} />
    <div className="w-100 ml-3">
      <Switch>
        <Route exact path="/risk-and-control/:id" component={RiskAndControl} />
        <Route path="/risk-and-control/" component={EmptyData} />
      </Switch>
    </div>
  </div>
);

export default RiskAndControlRoute;
