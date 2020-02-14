import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Route } from "react-router-dom";
import ReferenceSideBox from "./components/ReferenceSideBox";
import References from "./References";

const ReferenceRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/references" component={ReferenceSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route path="/references" component={References} />
        </Col>
      </Row>
    </Container>
  );
};

export default ReferenceRoute;
