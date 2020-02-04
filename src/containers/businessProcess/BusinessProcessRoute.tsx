import React from "react";
import { Route, Switch } from "react-router";
import BusinessProcesses from "./BusinessProcesses";
import BusinessProcess from "./BusinessProcess";
import CreateBusinessProcess from "./CreateBusinessProcess";
import BusinessProcessSideBox from "./components/BusinessProcessSideBox";
import { Row, Col, Container } from "reactstrap";

const ResourceRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/business-process" component={BusinessProcessSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route exact path="/business-process" component={BusinessProcesses} />
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
        </Col>
      </Row>
    </Container>
  );
};

export default ResourceRoute;
