import React from "react";
import { Route, Switch } from "react-router-dom";
import RiskAndControl from "./RiskAndControl";
import RiskAndControlSideBox from "./RiskAndControlSideBox";
import EmptyData from "./EmptyData";
import RiskAndControls from "./RiskAndControls";
import { Row, Col, Container } from "reactstrap";

const RiskAndControlRoute = () => {
  return (
    <Switch>
      <Route exact path="/risk-and-control" component={RiskAndControls} />
      <Route component={RestOfRiskAndControl} />
    </Switch>
  );
};

const RestOfRiskAndControl = () => (
  <Container fluid className="p-0">
    <Row noGutters>
      <Col md={3}>
        <Route path="/risk-and-control" component={RiskAndControlSideBox} />
      </Col>
      <Col md={9} className="p-4">
        <Switch>
          <Route
            path="/risk-and-control/:id"
            component={RiskAndControl}
          />
          <Route path="/risk-and-control/" component={EmptyData} />
        </Switch>
      </Col>
    </Row>
  </Container>
);

export default RiskAndControlRoute;
