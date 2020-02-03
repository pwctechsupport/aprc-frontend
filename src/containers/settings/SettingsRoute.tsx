import React from "react";
import { Route, Switch } from "react-router";
// import Policies from "./Policies";
// import Policy from "./Policy";
// import CreatePolicy from "./CreatePolicy";
// import CreateSubPolicy from "./CreateSubPolicy";
// import PolicySideBox from "./components/PolicySideBox";
import { Row, Col, Container } from "reactstrap";
import History from "./History";
import UpdateProfile from "./UpdateProfile";
import SettingsSideBox from "./components/SettingsSideBox";

const SettingsRoute = () => {
  return (
    <Switch>
      <Container fluid className="p-0">
        <Row noGutters>
          <Col md={3}>
            <Route path="/settings" component={SettingsSideBox} />
          </Col>
          <Col md={9} className="p-4">
            <Switch>
              <Route exact path="/settings/" component={UpdateProfile} />
              <Route exact path="/settings/history" component={History} />
            </Switch>
          </Col>
        </Row>
      </Container>
    </Switch>
  );
};

export default SettingsRoute;
