import React from "react";
import { Switch, Route } from "react-router-dom";
import Users from "./Users";
import CreateUser from "./CreateUser";

const UserRoute = () => {
  return (
    <Switch>
      <Route exact path="/user" component={Users} />
      <Route exact path="/user/create" component={CreateUser} />
    </Switch>
  );
};

export default UserRoute;
