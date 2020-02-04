import React from "react";
import { Route, Switch } from "react-router";
import Policies from "./Policies";
import Policy from "./Policy";
import CreatePolicy from "./CreatePolicy";
import CreateSubPolicy from "./CreateSubPolicy";
import PolicySideBox from "./components/PolicySideBox";
import { Row, Col, Container } from "reactstrap";

const PolicyRoute = () => {
  return (
    <Switch>
      <Route exact path="/policy" component={Policies} />
      <Route component={RestOfPolicies} />
    </Switch>
  );
};

const RestOfPolicies = () => (
  <Container fluid className="p-0">
    <Row noGutters>
      <Col md={3}>
        <Route path="/policy" component={PolicySideBox} />
      </Col>
      <Col md={9} className="p-4">
        <Switch>
          <Route
            exact
            path="/policy/:id/create-sub-policy"
            component={CreateSubPolicy}
          />
          <Route exact path="/policy/create" component={CreatePolicy} />
          <Route path="/policy/:id" component={Policy} />
        </Switch>
      </Col>
    </Row>
  </Container>
);

export default PolicyRoute;
