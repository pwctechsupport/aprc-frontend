import React from "react";
import { Route, Switch } from "react-router";
import { Col, Container, Row } from "reactstrap";
import PolicySideBox from "./components/PolicySideBox";
import CreatePolicy from "./CreatePolicy";
import CreateSubPolicy from "./CreateSubPolicy";
import Policy from "./Policy";
import EmptyScreen from "../../shared/components/EmptyScreen";

const PolicyAdminRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/policy-admin" component={PolicySideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Switch>
            <Route
              exact
              path="/policy-admin/:id/create-sub-policy"
              component={CreateSubPolicy}
            />
            <Route exact path="/policy-admin/create" component={CreatePolicy} />
            <Route path="/policy-admin/:id" component={Policy} />
            <Route path="/policy-admin" component={EmptyScreen} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default PolicyAdminRoute;
