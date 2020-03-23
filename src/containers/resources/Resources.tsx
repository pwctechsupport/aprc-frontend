import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFile, FaTrash, FaFileExport, FaFileImport } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  useDestroyResourceMutation,
  useResourcesQuery
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import downloadXls from "../../shared/utils/downloadXls";
import { notifySuccess } from "../../shared/utils/notif";
import ImportModal from "../../shared/components/ImportModal";

const Resources = ({ history }: RouteComponentProps) => {
  const { data, loading } = useResourcesQuery({ fetchPolicy: "network-only" });
  const [destroyResource, destroyM] = useDestroyResourceMutation({
    refetchQueries: ["resources"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed")
  });
  const [selected, setSelected] = useState<string[]>([]);
  const resources = oc(data).resources.collection([]);
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal(p => !p);
  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(resources.map(n => n.id));
    } else {
      setSelected([]);
    }
  }
  function handleExport() {
    downloadXls(
      "/prints/resource_excel.xlsx",
      {
        resource_ids: selected.map(Number)
      },
      {
        fileName: "resources.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed")
      }
    );
  }
  return (
    <div>
      <Helmet>
        <title>Resources - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/resources", "Resources"]]} />
      <div className="d-flex justify-content-end align-items-center mb-3">
        <div className="d-flex">
          <Tooltip
            description="Export Resource"
            subtitle={
              selected.length
                ? "Export selected resource"
                : "Select resources first"
            }
          >
            <Button
              color=""
              className="soft red mr-2"
              onClick={handleExport}
              disabled={!selected.length}
            >
              <FaFileExport />
            </Button>
          </Tooltip>
          <Tooltip description="Import Resource">
            <Button
              color=""
              className="soft orange mr-2"
              onClick={toggleImportModal}
            >
              <FaFileImport />
            </Button>
          </Tooltip>
          <ImportModal
            title="Import Resources"
            endpoint="/resources/import"
            isOpen={modal}
            toggle={toggleImportModal}
          />
        </div>
      </div>

      <Table loading={loading} responsive>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selected.length === resources.length}
                onChange={toggleCheckAll}
              />
            </th>
            <th>Name</th>
            <th>File Type</th>
            <th>Category</th>
            <th>Related Resource</th>
            <th>Related Policy</th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(resource.id)}
                      onClick={e => e.stopPropagation()}
                      onChange={() => toggleCheck(resource.id)}
                    />
                  </td>
                  <td>{resource.name}</td>
                  <td>{resource.resourceFileType}</td>
                  <td>{capitalCase(resource.category || "")}</td>
                  <td>
                    {oc(resource)
                      .controls([])
                      .map(c => c.typeOfControl)
                      .map(c => capitalCase(c || ""))
                      .join(", ")}
                  </td>
                  <td>
                    {oc(resource)
                      .policies([])
                      .map(p => p.title)
                      .join(", ")}
                  </td>
                  <td className="action">
                    <div className="d-flex align-items-center">
                      <Button className="soft orange mr-1" color="">
                        <Tooltip
                          description="Open File"
                          subtitle="Will be download if file type not supported"
                        >
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
                            <FaFile size={16} />
                          </a>
                        </Tooltip>
                      </Button>
                      <DialogButton
                        onConfirm={() =>
                          destroyResource({ variables: { id: resource.id } })
                        }
                        loading={destroyM.loading}
                        message={`Delete resource "${resource.name}"?`}
                        className="soft red"
                      >
                        <Tooltip description="Delete Resource">
                          <FaTrash className="clickable text-red" />
                        </Tooltip>
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
