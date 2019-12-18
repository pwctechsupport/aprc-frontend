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
        <Route path="/resources" component={ResourceSideBox} />
      </div>
      <div className="w-100 ml-3">
        <Route exact path="/resources" component={Resources} />
        <Switch>
          <Route exact path="/resources/create" component={CreateResource} />
          <Route exact path="/resources/:id" component={Resource} />
        </Switch>
      </div>
    </div>
  );
};

export default ResourceRoute;
