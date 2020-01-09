import React from "react";
import { Route, Switch } from "react-router";
import BusinessProcesses from "./BusinessProcesses";
import BusinessProcess from "./BusinessProcess";
import CreateBusinessProcess from "./CreateBusinessProcess";
import BusinessProcessSideBox from "./components/BusinessProcessSideBox";
import { Row, Col } from "reactstrap";

const ResourceRoute = () => {
  return (
    <Row>
      <Col md={3}>
        <Route path="/business-process" component={BusinessProcessSideBox} />
      </Col>
      <Col md={9}>
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
  );
};

export default ResourceRoute;
