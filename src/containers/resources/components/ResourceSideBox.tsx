import React, { useState } from "react";
import { Input } from "reactstrap";
import { useResourcesQuery } from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";
import humanizeDate from "../../../shared/utils/humanizeDate";
import { useDebounce } from "use-debounce/lib";

const ResourceSideBox = () => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 500);
  const { data } = useResourcesQuery({
    variables: { filter: { name_cont: searchQuery } }
  });
  const resources = oc(data)
    .resources.collection([])
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="side-box p-3">
      <Input
        value={search}
        placeholder="Search Resources..."
        onChange={e => setSearch(e.target.value)}
        className="orange mb-3"
      />
      <h5 className="text-orange">Recently Added</h5>
      <div>
        {resources.map(resource => (
          <Link
            className="side-box__item text-white d-flex justify-content-between mt-2 py-1"
            to={`/resources/${resource.id}`}
            key={resource.id}
          >
            <div className="text-orange">{resource.name}</div>
            <div className="text-orange">
              {humanizeDate(new Date(resource.updatedAt))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResourceSideBox;
