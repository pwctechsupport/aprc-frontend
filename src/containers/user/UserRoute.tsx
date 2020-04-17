import React from "react";
import { Switch, Route } from "react-router-dom";
import Users from "./Users";
import CreateUser from "./CreateUser";
import Department from "./Departments";

const UserRoute = () => {
  return (
    <Switch>
      <Route exact path="/user" component={Users} />
      <Route exact path="/user/create" component={CreateUser} />
      <Route exact path="/user/department" component={Department} />
    </Switch>
  );
};

export default UserRoute;
