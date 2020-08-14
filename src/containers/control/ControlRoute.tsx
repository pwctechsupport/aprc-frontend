import React from "react";
import { Route, Switch } from "react-router-dom";
import Controls from "./Controls";
import CreateControl from "./CreateControl";
import Control from "./Control";
import { Row, Col, Container } from "reactstrap";
import ControlSideBox from "./components/ControlSideBox";
import Footer from "../../shared/components/Footer";

const ControlRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/control" component={ControlSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <div style={{ minHeight: "80vh" }}>
            <Route exact path="/control" component={Controls} />
            <Switch>
              <Route exact path="/control/create" component={CreateControl} />
              <Route exact path="/control/:id" component={Control} />
            </Switch>
          </div>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default ControlRoute;
