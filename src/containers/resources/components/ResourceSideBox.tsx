import React, { useState } from "react";
import { Input } from "reactstrap";
import { useResourcesQuery } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";
import { date } from "../../../shared/formatter";

const ResourceSideBox = () => {
  const [search, setSearch] = useState("");
  const { data } = useResourcesQuery({
    variables: { filter: { name_cont: search } }
  });
  const resources = oc(data)
    .resources.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .filter((_, i) => i < 5);

  return (
    <div className="side-box p-2">
      <Input
        value={search}
        placeholder="Search Policies..."
        onChange={e => setSearch(e.target.value)}
        className="dark mb-3"
      />
      <h5>Recently Added</h5>
      <div>
        {resources.map(resource => (
          <Link
            className="side-box__item text-white d-flex justify-content-between mt-2 py-1"
            to={`/resources/${resource.id}`}
            key={resource.id}
          >
            <div className="">{resource.name}</div>
            <div>{date(resource.updatedAt)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResourceSideBox;
