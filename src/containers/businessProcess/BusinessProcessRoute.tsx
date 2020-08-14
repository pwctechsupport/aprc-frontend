import React from "react";
import { Route, Switch } from "react-router";
import BusinessProcesses from "./BusinessProcesses";
import BusinessProcess from "./BusinessProcess";
import CreateBusinessProcess from "./CreateBusinessProcess";
import BusinessProcessSideBox from "./components/BusinessProcessSideBox";
import { Row, Col, Container } from "reactstrap";
import Footer from "../../shared/components/Footer";

const ResourceRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/business-process" component={BusinessProcessSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <div style={{ minHeight: "80vh" }}>
            <Route
              exact
              path="/business-process"
              component={BusinessProcesses}
            />
            <Switch>
              <Route
                exact
                path="/business-process/create"
                component={CreateBusinessProcess}
              />
              <Route
                exact
                path="/business-process/:id"
                component={BusinessProcess}
              />
            </Switch>
          </div>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default ResourceRoute;
