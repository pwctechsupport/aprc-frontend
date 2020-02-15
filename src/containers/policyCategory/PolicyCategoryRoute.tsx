import React from "react";
import { Route, Switch } from "react-router";
import { Col, Container, Row } from "reactstrap";
import EmptyScreen from "../../shared/components/EmptyScreen";
import PolicyCategorySideBox from "./components/PolicyCategorySideBox";
import CreatePolicyCategory from "./CreatePolicyCategory";
import PolicyCategory from "./PolicyCategory";

const PolicyCategoryRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/policy-category" component={PolicyCategorySideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route exact path="/policy-category" component={EmptyScreen} />
          <Switch>
            <Route
              exact
              path="/policy-category/create"
              component={CreatePolicyCategory}
            />
            <Route
              exact
              path="/policy-category/:id"
              component={PolicyCategory}
            />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default PolicyCategoryRoute;
