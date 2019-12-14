import React from "react";
import { Route, Switch } from "react-router";
import Resources from "./Resources";
import Resource from "./Resource";
import CreateResource from "./CreateResource";
import ResourceSideBox from "./components/ResourceSideBox";

const ResourceRoute = () => {
  return (
    <div className="d-flex">
      <div>
        <Route path="/admin/resources" component={ResourceSideBox} />
      </div>
      <div className="w-100 ml-3">
        <Route exact path="/admin/resources" component={Resources} />
        <Switch>
          <Route exact path="/admin/resources/:id" component={Resource} />
          <Route exact path="/admin/resources/create" component={CreateResource} />
        </Switch>
      </div>
    </div>
  );
};

export default ResourceRoute;
