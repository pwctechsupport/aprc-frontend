import React from "react";
import { Route, Switch } from "react-router-dom";
import RiskAndControl from "./RiskAndControl";
import RiskAndControlSideBox from "./RiskAndControlSideBox";
import EmptyData from "./EmptyData";
import RiskAndControls from "./RiskAndControls";
import { Row, Col } from "reactstrap";

const RiskAndControlRoute = () => {
  return (
    <Switch>
      <Route exact path="/risk-and-control" component={RiskAndControls} />
      <Route component={RestOfRiskAndControl} />
    </Switch>
  );
};

const RestOfRiskAndControl = () => (
  <Row>
    <Col md={3}>
      <Route path="/risk-and-control" component={RiskAndControlSideBox} />
    </Col>
    <Col md={9}>
      <Switch>
        <Route exact path="/risk-and-control/:id" component={RiskAndControl} />
        <Route path="/risk-and-control/" component={EmptyData} />
      </Switch>
    </Col>
  </Row>
);

export default RiskAndControlRoute;
