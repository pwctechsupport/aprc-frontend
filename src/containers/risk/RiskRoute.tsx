import React from "react";
import { Route, Switch } from "react-router";
import Risks from "./Risks";
import CreateRisk from "./CreateRisk";
import Risk from "./Risk";
import RiskSideBox from "./components/RiskSideBox";
import { Row, Col, Container } from "reactstrap";

const RiskRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/risk" component={RiskSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route exact path="/risk" component={Risks} />
          <Switch>
            <Route exact path="/risk/create" component={CreateRisk} />
            <Route exact path="/risk/:id" component={Risk} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default RiskRoute;
