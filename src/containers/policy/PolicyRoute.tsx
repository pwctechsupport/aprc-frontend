import React from "react";
import { Route, Switch } from "react-router";
import { Col, Container, Row } from "reactstrap";
import PolicySideBox from "./components/PolicySideBox";
import CreatePolicy from "./CreatePolicy";
import CreateSubPolicy from "./CreateSubPolicy";
import Policies from "./Policies";
import Policy from "./Policy";
import Footer from "../../shared/components/Footer";
import ScrollToTop from "../../shared/components/ScrollToTop";

const PolicyRoute = () => {
  return (
    <div>
      <Container fluid className="p-0">
        <Row noGutters>
          <Col md={3}>
            <Route path="/policy" component={PolicySideBox} />
          </Col>
          <Col md={9} className="p-4">
            <div style={{ minHeight: "85vh" }}>
              <ScrollToTop>
                <Switch>
                  <Route
                    exact
                    path="/policy/:id/create-sub-policy"
                    component={CreateSubPolicy}
                  />
                  <Route exact path="/policy/create" component={CreatePolicy} />
                  <Route path="/policy/:id" component={Policy} />
                  <Route path="/policy" component={Policies} />
                </Switch>
              </ScrollToTop>
            </div>
            <Footer />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PolicyRoute;
