import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Route, Switch } from "react-router-dom";
import ReferenceSideBox from "./components/ReferenceSideBox";
import References from "./References";
import CreateReference from "./CreateReference";
import Reference from "./Reference";

const ReferenceRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/references" component={ReferenceSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route exact path="/references" component={References} />
          <Switch>
            <Route
              exact
              path="/references/create"
              component={CreateReference}
            />
            <Route path="/references/:id" component={Reference} />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default ReferenceRoute;
