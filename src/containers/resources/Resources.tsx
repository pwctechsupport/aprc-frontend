import React from "react";
import { FaTrash, FaDownload, FaFileAlt } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
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
import BreadCrumb from "../../shared/components/BreadCrumb";

const Resources = ({ history }: RouteComponentProps) => {
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
      <BreadCrumb crumbs={[["/resources", "Resources"]]} />
      <div className="d-flex justify-content-between align-items-center">
        <h4>Resources</h4>

        <Link to="/resources/create">
          <Button className="pwc">+ Add Resource</Button>
        </Link>
      </div>

      <Table loading={loading}>
        <thead>
          <tr>
            <th>Name</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {oc(data)
            .resources.collection([])
            .map(resource => {
              return (
                <tr
                  key={resource.id}
                  onClick={() => history.push(`/resources/${resource.id}`)}
                >
                  <td>{resource.name}</td>
                  <td className="action">
                    <div className="d-flex align-items-center">
                      <Button color="">
                        <a
                          href={`http://mandalorian.rubyh.co${resource.resuploadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(
                            event: React.MouseEvent<
                              HTMLAnchorElement,
                              MouseEvent
                            >
                          ) => {
                            event.stopPropagation();
                          }}
                        >
                          <FaFileAlt size={16} />
                        </a>
                      </Button>
                      <Button color="">
                        <a
                          href={`http://mandalorian.rubyh.co${resource.resuploadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(
                            event: React.MouseEvent<
                              HTMLAnchorElement,
                              MouseEvent
                            >
                          ) => {
                            event.stopPropagation();
                          }}
                          download
                        >
                          <FaDownload size={16} />
                        </a>
                      </Button>
                      <DialogButton
                        onConfirm={() =>
                          destroyResource({ variables: { id: resource.id } })
                        }
                        loading={destroyM.loading}
                        message={`Delete resource "${resource.name}"?`}
                      >
                        <FaTrash className="clickable text-red" />
                      </DialogButton>
                    </div>
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
