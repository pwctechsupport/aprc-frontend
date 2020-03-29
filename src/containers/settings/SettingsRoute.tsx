import React from "react";
import { Redirect, Route, Switch } from "react-router";
import { Col, Container, Row } from "reactstrap";
import SettingsSideBox from "./components/SettingsSideBox";
import History from "./History";
import NotificationSettings from "./NotificationSettings";
import UpdateProfile from "./UpdateProfile";
import UserManual from "./UserManual";

export default function SettingsRoute() {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/settings" component={SettingsSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Switch>
            <Route
              exact
              path="/settings/update-profile"
              component={UpdateProfile}
            />
            <Route exact path="/settings/history" component={History} />
            <Route
              exact
              path="/settings/notifications"
              component={NotificationSettings}
            />
            <Route exact path="/settings/user-manual" component={UserManual} />
            <Redirect exact from="/settings" to="/settings/update-profile" />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
}
