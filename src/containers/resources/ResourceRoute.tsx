import React from "react";
import { Route, Switch } from "react-router";
import Resources from "./Resources";
import Resource from "./Resource";
import CreateResource from "./CreateResource";
import ResourceSideBox from "./components/ResourceSideBox";
import { Row, Col, Container } from "reactstrap";

const ResourceRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/resources" component={ResourceSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route exact path="/resources" component={Resources} />
          <Switch>
            <Route exact path="/resources/create" component={CreateResource} />
            <Route exact path="/resources/:id" component={Resource} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default ResourceRoute;
