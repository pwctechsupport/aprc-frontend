import React from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  useDestroyResourceMutation,
  useResourcesQuery
} from "../../generated/graphql";
import Table from "../../shared/components/Table";
import Button from "../../shared/components/Button";
import Helmet from "react-helmet";
import DialogButton from "../../shared/components/DialogButton";

const Resources = () => {
  const { data, loading } = useResourcesQuery();
  const [destroyResource, destroyM] = useDestroyResourceMutation({
    refetchQueries: ["resources"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed")
  });

  return (
    <div>
      <Helmet>
        <title>Resources - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Resources</h1>

        <Link to="/resources/create">
          <Button className="pwc">+ Add Resource</Button>
        </Link>
      </div>

      <Table loading={loading}>
        <thead>
          <tr>
            <th>Name</th>
            <th>File</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {oc(data)
            .resources.collection([])
            .map(resource => {
              return (
                <tr key={resource.id}>
                  <td>
                    <Link to={`/resources/${resource.id}`}>
                      {resource.name}
                    </Link>
                  </td>
                  <td>
                    <a
                      href={`http://mandalorian.rubyh.co${resource.resuploadUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </td>
                  <td>
                    <DialogButton
                      onConfirm={() => destroyResource({ variables: { id: resource.id } }) }
                      loading={destroyM.loading}
                    >
                      <FaTrash
                        className="clickable"
                      />
                    </DialogButton>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </div>
  );
};

export default Resources;
