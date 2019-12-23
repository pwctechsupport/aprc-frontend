import React from "react";
import { Route, Switch } from "react-router-dom";
import RiskAndControl from "./RiskAndControl";
import RiskAndControlSideBox from "./RiskAndControlSideBox";
import EmptyData from "./EmptyData";

const RiskAndControlRoute = () => {
  return (
    <div className="d-flex">
      <Route path="/risk-and-control" component={RiskAndControlSideBox} />
      <div className="w-100 ml-3">
        <Switch>
          <Route
            exact
            path="/risk-and-control/:id"
            component={RiskAndControl}
          />
          <Route path="/risk-and-control/" component={EmptyData} />
        </Switch>
      </div>
    </div>
  );
};

export default RiskAndControlRoute;
