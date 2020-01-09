import React from "react";
import { Route, Switch } from "react-router";
import Risks from "./Risks";
import CreateRisk from "./CreateRisk";
import Risk from "./Risk";
import RiskSideBox from "./components/RiskSideBox";
import { Row, Col } from "reactstrap";

const RiskRoute = () => {
  return (
    <Row>
      <Col md={3}>
        <Route path="/risk" component={RiskSideBox} />
      </Col>
      <Col md={9}>
        <Route exact path="/risk" component={Risks} />
        <Switch>
          <Route exact path="/risk/create" component={CreateRisk} />
          <Route exact path="/risk/:id" component={Risk} />
        </Switch>
      </Col>
    </Row>
  );
};

export default RiskRoute;
