import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaDownload, FaFileExport, FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  useDestroyResourceMutation,
  useRecentResourcesQuery,
  useReviewerResourcesStatusQuery,
} from "../../generated/graphql";
import { APP_ROOT_URL } from "../../settings";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DateHover from "../../shared/components/DateHover";
import DialogButton from "../../shared/components/DialogButton";
import CheckBox from "../../shared/components/forms/CheckBox";
import Pagination from "../../shared/components/Pagination";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useListState from "../../shared/hooks/useList";
import downloadXls from "../../shared/utils/downloadXls";
import { notifySuccess } from "../../shared/utils/notif";
import PickIcon from "../../assets/Icons/PickIcon";

const Resources = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const { data: adminData, loading: adminLoading } = useRecentResourcesQuery({
    skip: isAdminReviewer,
    variables: {
      filter: isAdminPreparer ? {} : { draft_id_not_null: true },
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const {
    data: dataReviewer,
    loading: loadingReviewer,
  } = useReviewerResourcesStatusQuery({
    skip: isUser || isAdminPreparer,
    variables: {
      filter: {},
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const totalCount =
    dataReviewer?.reviewerResourcesStatus?.metadata.totalCount ||
    adminData?.recentResources?.metadata.totalCount ||
    0;

  const [destroyResource, destroyM] = useDestroyResourceMutation({
    refetchQueries: ["resources", "recentResources", "reviewerResourcesStatus"],
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
  });
  const [selected, setSelected] = useState<string[]>([]);
  const resources =
    adminData?.recentResources?.collection ||
    dataReviewer?.reviewerResourcesStatus?.collection ||
    [];
  // const [modal, setModal] = useState(false);
  // const toggleImportModal = () => setModal((p) => !p);
  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  const [clicked, setClicked] = useState(true);
  const clickButton = () => setClicked((p) => !p);

  function toggleCheckAll() {
    if (clicked) {
      setSelected(resources.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/resource_excel.xlsx",
      {
        resource_ids: selected.map(Number),
      },
      {
        fileName: "resources.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed"),
      }
    );
  }

  return (
    <div>
      <Helmet>
        <title>Resources - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/resources", "Resources"]]} />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ fontSize: "23px" }}>Resources</h4>

        {isAdminReviewer ? (
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
            {/* <Tooltip description="Import Resource">
              <Button
                color=""
                className="soft orange mr-2"
                onClick={toggleImportModal}
              >
                <FaFileImport />
              </Button>
            </Tooltip> */}
            {/* <ImportModal
              title="Import Resources"
              endpoint="/resources/import"
              isOpen={modal}
              toggle={toggleImportModal}
            /> */}
          </div>
        ) : null}
        {isAdmin || isAdminPreparer ? (
          <Button tag={Link} to="/resources/create" className="pwc">
            + Add resource
          </Button>
        ) : null}
      </div>
      <Table loading={adminLoading || loadingReviewer} responsive>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th>
                <CheckBox
                  checked={selected.length === resources.length}
                  onClick={() => {
                    clickButton();
                    toggleCheckAll();
                  }}
                />
              </th>
            ) : null}

            <th style={{ width: "12%" }}>Name</th>
            <th style={{ width: "10%" }}>File type</th>
            <th style={{ width: "10%" }}>Category</th>
            <th style={{ width: "16%" }}>Related policy</th>
            <th style={{ width: "16%" }}>Related business process</th>
            <th style={{ width: "10%" }}>Last updated</th>
            <th style={{ width: "10%" }}>Created by</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            return (
              <tr
                key={resource.id}
                onClick={() => history.push(`/resources/${resource.id}`)}
              >
                {isAdminReviewer ? (
                  <td>
                    <CheckBox
                      checked={selected.includes(resource.id)}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        toggleCheck(resource.id);
                      }}
                    />
                  </td>
                ) : null}
                <td>{resource.name}</td>
                <td>{resource.resourceFileType}</td>
                <td>{capitalCase(resource.category || "")}</td>

                <td>
                  {oc(resource)
                    .policies([])
                    .map((p) => p.title)
                    .join(", ")}
                </td>
                <td>{resource.businessProcess?.name}</td>
                <td>
                  <DateHover>{resource.updatedAt}</DateHover>
                </td>
                <td>{resource.createdBy}</td>
                <td className="action">
                  <div className="d-flex align-items-center">
                    <Button className="soft orange mr-1" color="">
                      <Tooltip
                        description="Open File"
                        subtitle="Will be download if file type not supported"
                      >
                        <a
                          href={`${APP_ROOT_URL}${resource.resuploadUrl}`}
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
                          <PickIcon name="downloadOrange" />
                        </a>
                      </Tooltip>
                    </Button>
                    {isAdminReviewer && (
                      <DialogButton
                        onConfirm={() =>
                          destroyResource({ variables: { id: resource.id } })
                        }
                        loading={destroyM.loading}
                        message={`Delete resource "${resource.name}"?`}
                        className="soft red"
                      >
                        <Tooltip description="Delete Resource">
                          <PickIcon name="trash" className="clickable" />
                        </Tooltip>
                      </DialogButton>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Resources;
