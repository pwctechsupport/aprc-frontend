import React from "react";
import { Route, Switch } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import RiskAndControl from "./RiskAndControl";
import RiskAndControls from "./RiskAndControls";
import RiskAndControlSideBox from "./RiskAndControlSideBox";
import Footer from "../../shared/components/Footer";

const RiskAndControlRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/risk-and-control" component={RiskAndControlSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <div style={{ minHeight: "80vh" }}>
            <Switch>
              <Route path="/risk-and-control/:id" component={RiskAndControl} />
              <Route path="/risk-and-control" component={RiskAndControls} />
            </Switch>
          </div>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default RiskAndControlRoute;
