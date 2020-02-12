import React from "react";
import { Route, Switch } from "react-router";
import { Col, Container, Row } from "reactstrap";
import PolicySideBox from "./components/PolicySideBox";
import CreatePolicy from "./CreatePolicy";
import CreateSubPolicy from "./CreateSubPolicy";
import Policy from "./Policy";
import EmptyScreen from "../../shared/components/EmptyScreen";

const PolicyRoute = () => {
  return (
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
            <Route path="/policy/" component={EmptyScreen} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default PolicyRoute;
