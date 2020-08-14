import React from "react";
import { Route, Switch } from "react-router";
import Risks from "./Risks";
import CreateRisk from "./CreateRisk";
import Risk from "./Risk";
import RiskSideBox from "./components/RiskSideBox";
import { Row, Col, Container } from "reactstrap";
import Footer from "../../shared/components/Footer";

const RiskRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/risk" component={RiskSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <div style={{ minHeight: "80vh" }}>
            <Route exact path="/risk" component={Risks} />
            <Switch>
              <Route exact path="/risk/create" component={CreateRisk} />
              <Route exact path="/risk/:id" component={Risk} />
            </Switch>
          </div>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default RiskRoute;
