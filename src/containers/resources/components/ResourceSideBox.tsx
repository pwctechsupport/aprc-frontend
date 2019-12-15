import React, { useState } from "react";
import { Input } from "reactstrap";
import { useResourcesQuery } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";

const ResourceSideBox = () => {
  const [search, setSearch] = useState("");
  const { data } = useResourcesQuery({
    variables: { filter: { name_cont: search } }
  });
  const resources = oc(data).resources.collection([]);

  return (
    <div className="side-box p-2">
      <Input
        value={search}
        placeholder="Search Policies..."
        onChange={e => setSearch(e.target.value)}
        className="dark mb-3"
      />
      <div>
        {resources.map(resource => (
          <div>
            <Link className="side-box__item" to={`/resources/${resource.id}`}>
              {resource.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceSideBox;
