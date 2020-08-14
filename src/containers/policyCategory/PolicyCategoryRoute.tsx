import React from "react";
import { Route, Switch } from "react-router";
import { Col, Container, Row } from "reactstrap";
import PolicyCategoryLines from "../../../src/containers/policyCategory/components/PolicyCategoryLines";
import PolicyCategorySideBox from "./components/PolicyCategorySideBox";
import CreatePolicyCategory from "./CreatePolicyCategory";
import PolicyCategory from "./PolicyCategory";
import Footer from "../../shared/components/Footer";

const PolicyCategoryRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/policy-category" component={PolicyCategorySideBox} />
        </Col>
        <Col md={9} className="p-4">
          <div style={{ minHeight: "80vh" }}>
            <Route
              exact
              path="/policy-category"
              component={PolicyCategoryLines}
            />
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
          </div>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default PolicyCategoryRoute;
