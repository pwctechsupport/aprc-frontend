import startCase from "lodash/startCase";
import React, { useState, Fragment, useEffect } from "react";
import {
  FaBars,
  FaBookmark,
  FaEllipsisV,
  FaFilePdf,
  FaMinus,
  FaPencilAlt,
} from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { NavLink, Route, RouteComponentProps, Link } from "react-router-dom";
import {
  Badge,
  Nav,
  NavItem,
  TabContent,
  Table,
  TabPane,
  Row,
  Col,
} from "reactstrap";
import {
  Assertion,
  Control,
  Frequency,
  Ipo,
  LevelOfRisk,
  Nature,
  Status,
  TypeOfControl,
  TypeOfRisk,
  useBusinessProcessQuery,
  useCreateBookmarkBusinessProcessMutation,
  useUpdateControlMutation,
  useUpdateRiskMutation,
  useBookmarksQuery,
  useResourceRatingsQuery,
  useResourceQuery,
  useResourcesQuery,
  useBusinessProcessesQuery,
} from "../../generated/graphql";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu from "../../shared/components/Menu";
import Modal from "../../shared/components/Modal";
import ResourcesTab from "../../shared/components/ResourcesTab";
import Tooltip from "../../shared/components/Tooltip";
import { toLabelValue } from "../../shared/formatter";
import {
  downloadPdf,
  emailPdf,
  previewPdf,
} from "../../shared/utils/accessGeneratedPdf";
import getRiskColor from "../../shared/utils/getRiskColor";
import {
  notifyError,
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import ControlForm, {
  ControlFormValues,
  CreateControlFormValues,
} from "../control/components/ControlForm";
import RiskForm, { RiskFormValues } from "../risk/components/RiskForm";
import Flowcharts from "./components/Flowcharts";
import useAccessRights from "../../shared/hooks/useAccessRights";
import { useSelector } from "../../shared/hooks/useSelector";
import { APP_ROOT_URL } from "../../settings";
import ResourceBox from "../resources/components/ResourceBox";

type TParams = { id: string };

export default function RiskAndControl({
  match,
  history,
}: RouteComponentProps<TParams>) {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);
  const initialCollapse = ["Risks", "Controls"];
  const [collapse, setCollapse] = useState(initialCollapse);
  const toggleCollapse = (name: string) =>
    setCollapse((p) => {
      if (p.includes(name)) {
        return p.filter((item) => item !== name);
      }
      return p.concat(name);
    });
  const openAllCollapse = () => setCollapse(initialCollapse);
  const closeAllCollapse = () => setCollapse([]);

  // Edit Risk Mutation and Modal state
  const [riskModal, setRiskModal] = useState(false);
  const [risk, setRisk] = useState<RiskState>();
  const toggleRiskModal = () => setRiskModal((p) => !p);
  const editRisk = (risk: RiskState) => {
    setRiskModal(true);
    setRisk(risk);
  };
  const [updateRisk, updateRiskM] = useUpdateRiskMutation({
    onCompleted: () => {
      notifySuccess("Risk Updated");
      toggleRiskModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess"],
  });
  const handleUpdateRisk = (values: RiskFormValues) => {
    updateRisk({
      variables: {
        input: {
          id: risk?.id || "",
          name: values.name,
          businessProcessIds: values.businessProcessIds?.map((a) => a.value),
          levelOfRisk: values.levelOfRisk,
          typeOfRisk: values.typeOfRisk,
        },
      },
    });
  };

  // Edit Control Mutation and Modal State
  const [controlModal, setControlModal] = useState(false);
  const [control, setControl] = useState<ControlState>();
  const toggleControlModal = () => setControlModal((p) => !p);
  const editControl = (control: ControlState) => {
    setControlModal(true);
    setControl(control);
  };
  const [updateControl, updateControlM] = useUpdateControlMutation({
    onCompleted: () => {
      notifySuccess("Control Updated");
      toggleControlModal();
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["businessProcess"],
  });
  const handleUpdateControl = (values: CreateControlFormValues) => {
    updateControl({
      variables: { input: { id: control?.id || "", ...values } },
    });
  };

  const [addBookmark] = useCreateBookmarkBusinessProcessMutation({
    onCompleted: () => notifySuccess("Added to Bookmark"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["businessProcess", "bookmarks"],
    awaitRefetchQueries: true,
  });

  const { id } = match.params;

  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  const { data: dataResources, loading: loadingResources } = useResourcesQuery({
    skip: !history.location.pathname.includes("/flowchart"),
    variables: {
      filter: isUser
        ? { business_process_id_eq: id, draft_id_null: true }
        : { business_process_id_eq: id },
    },
    fetchPolicy: "network-only",
  });
  const bpIds = data?.businessProcess?.id || [];
  const bpIds2 = data?.businessProcess?.children?.map((a) => a.id) || [];
  const bpIds3 =
    data?.businessProcess?.children?.map((a) => a.children?.map((b) => b.id)) ||
    [];
  const bpIds4 =
    data?.businessProcess?.children?.map((a) =>
      a.children?.map((b) => b.children?.map((c) => c.id))
    ) || [];
  const bpIds5 =
    data?.businessProcess?.children?.map((a) =>
      a.children?.map((b) =>
        b.children?.map((c) => c.children?.map((d) => d.id))
      )
    ) || [];
  const bpIds6 =
    data?.businessProcess?.children?.map((a) =>
      a.children?.map((b) =>
        b.children?.map((c) =>
          c.children?.map((d) => d.children?.map((e) => e.id))
        )
      )
    ) || [];
  const bpIdsTotal = [
    bpIds,
    ...bpIds2.flat(10),
    ...bpIds3.flat(10),
    ...bpIds4.flat(10),
    ...bpIds5.flat(10),
    ...bpIds6.flat(10),
  ];

  // bookmark Query
  const { data: bookmarkData, loading: bookmarkLoading } = useBookmarksQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: { originator_id_eq: id, originator_type_eq: "BusinessProcess" },
    },
  });

  const {
    data: dataRisksnControl,
    loading: loadingRisksnControl,
  } = useBusinessProcessesQuery({
    skip:
      history.location.pathname.includes("resources") ||
      history.location.pathname.includes("flowchart"),
    variables: {
      filter: isUser
        ? { id_matches_any: bpIdsTotal, draft_id_null: true }
        : { id_matches_any: bpIdsTotal },
    },
    fetchPolicy: "network-only",
  });

  const name = data?.businessProcess?.name || "";
  const risks =
    dataRisksnControl?.navigatorBusinessProcesses?.collection
      .map((a) => a.risks)
      .flat(10) || [];
  const controls =
    dataRisksnControl?.navigatorBusinessProcesses?.collection
      .map((a) => a.controls)
      .flat(10) || [];
  const resources = dataResources?.navigatorResources?.collection || [];

  const isBookmarked = bookmarkData?.bookmarks?.collection || [];
  const ancestors = data?.businessProcess?.ancestors || [];
  const breadcrumb = ancestors.map((a) => [
    "/risk-and-control/" + a.id,
    a.name,
  ]) as CrumbItem[];

  const tabs = [
    { to: `/risk-and-control/${id}`, title: "Detail" },
    { to: `/risk-and-control/${id}/flowchart`, title: "Flowchart" },
    { to: `/risk-and-control/${id}/resources`, title: "Resources" },
  ];
  //resources Bar
  const currentUrl = history.location.pathname;
  const [resourceId, setResourceId] = useState("");
  const userId = useSelector((state) => state.auth.user)?.id;
  useEffect(() => {
    if (currentUrl.includes("resources/")) {
      setResourceId(currentUrl.split("resources/")[1]);
    }
  }, [currentUrl]);

  // query for Flowchart Tab
  const { data: dataResource, loading: loadingResource } = useResourceQuery({
    variables: { id: resourceId },
    fetchPolicy: "network-only",
  });

  //Query for rating resource
  const { data: dataRating } = useResourceRatingsQuery({
    skip: !resourceId && currentUrl.includes("resources/"),
    variables: { filter: { user_id_eq: userId, resource_id_eq: resourceId } },
    fetchPolicy: "network-only",
  });
  const resourceName = dataResource?.resource?.name || "";

  const renderResourceDetails = () => {
    const totalRating = dataResource?.resource?.totalRating || 0;
    const visit = dataResource?.resource?.visit || 0;
    const resourceFileType = dataResource?.resource?.resourceFileType;
    const businessProcess = dataResource?.resource?.businessProcess;
    const resuploadUrl = dataResource?.resource?.resuploadUrl;
    const category = dataResource?.resource?.category;
    const resuploadLink = dataResource?.resource?.resuploadLink;
    const policies = dataResource?.resource?.policies || [];
    const controls = dataResource?.resource?.controls || [];
    const base64File = dataResource?.resource?.base64File;
    const rating =
      dataRating?.resourceRatings?.collection.map((a) => a.rating).pop() || 0;
    const imagePreviewUrl = resuploadLink
      ? resuploadLink
      : resuploadUrl && !resuploadLink?.includes("original/missing.png")
      ? `${APP_ROOT_URL}${resuploadUrl}`
      : undefined;
    return (
      <Route exact path="/risk-and-control/:id/resources/:id">
        <div>
          <Row>
            {resourceName ? (
              <Fragment>
                <Col xs={12} lg={6}>
                  <ResourceBox
                    base64File={base64File}
                    id={resourceId}
                    name={resourceName}
                    rating={rating}
                    totalRating={totalRating}
                    views={visit}
                    imagePreviewUrl={imagePreviewUrl}
                    resourceFileType={resourceFileType}
                  />
                </Col>
                <Col xs={12} lg={6}>
                  <div className="mt-5 mt-lg-0">
                    <h5>
                      Category:&nbsp;
                      <span className="text-orange">{category}</span>
                    </h5>
                    {category === "Flowchart" ? (
                      <>
                        <h5 className="mt-5">Business Process:</h5>
                        <Link to={`/risk-and-control/${businessProcess?.id}`}>
                          {businessProcess?.name}
                        </Link>
                      </>
                    ) : (
                      <>
                        <div>
                          <h5 className="mt-5">Related Controls:</h5>
                          {controls.length ? (
                            <ul>
                              {controls.map((control) => (
                                <li key={control.id}>{control.description}</li>
                              ))}
                            </ul>
                          ) : (
                            <EmptyAttribute centered={false} />
                          )}
                        </div>
                        <div>
                          <h5 className="mt-5">Related Policies:</h5>
                          {policies.length ? (
                            <ul>
                              {policies.map((policy) => (
                                <li key={policy.id}>
                                  <Link to={`/policy/${policy.id}`}>
                                    {policy.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <EmptyAttribute centered={false} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Col>
              </Fragment>
            ) : null}
          </Row>
        </div>
      </Route>
    );
  };
  if (loadingRisksnControl || loading || loadingResource)
    return <LoadingSpinner size={30} centered />;

  const renderActions = () => {
    return (
      <div className="d-flex align-items-center">
        {!history.location.pathname.includes("resources") &&
          !history.location.pathname.includes("flowchart") && (
            <Tooltip
              description={
                collapse.length === initialCollapse.length
                  ? "Hide All Attribute"
                  : "Show All Attribute"
              }
            >
              <Button
                className="ml-3"
                color="transparent"
                onClick={() => {
                  collapse.length === initialCollapse.length
                    ? closeAllCollapse()
                    : openAllCollapse();
                }}
              >
                {collapse.length === initialCollapse.length ? (
                  <FaMinus size={20} />
                ) : (
                  <FaBars size={20} />
                )}
              </Button>
            </Tooltip>
          )}

        <Menu
          data={
            bookmarkLoading
              ? [
                  {
                    label: (
                      <Fragment>
                        <LoadingSpinner className="mt-2 mb-2" centered />
                      </Fragment>
                    ),
                  },
                ]
              : isBookmarked.length
              ? [
                  {
                    label: (
                      <div>
                        <FaFilePdf /> Preview
                      </div>
                    ),
                    onClick: () =>
                      previewPdf(`prints/${id}/business_process.pdf`, {
                        onStart: () =>
                          notifyInfo("Downloading file for preview", {
                            autoClose: 10000,
                          }),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <IoMdDownload /> Download
                      </div>
                    ),
                    onClick: () =>
                      downloadPdf(`prints/${id}/business_process.pdf`, {
                        fileName: name,
                        onStart: () => notifyInfo("Download Started"),
                        onError: () => notifyError("Download Failed"),
                        onCompleted: () => notifySuccess("Download Success"),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <MdEmail /> Mail
                      </div>
                    ),
                    onClick: () => emailPdf(name),
                  },
                ]
              : [
                  {
                    label: (
                      <div>
                        <FaFilePdf /> Preview
                      </div>
                    ),
                    onClick: () =>
                      previewPdf(`prints/${id}/business_process.pdf`, {
                        onStart: () =>
                          notifyInfo("Downloading file for preview", {
                            autoClose: 10000,
                          }),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <IoMdDownload /> Download
                      </div>
                    ),
                    onClick: () =>
                      downloadPdf(`prints/${id}/business_process.pdf`, {
                        fileName: name,
                        onStart: () => notifyInfo("Download Started"),
                        onError: () => notifyError("Download Failed"),
                        onCompleted: () => notifySuccess("Download Success"),
                      }),
                  },
                  {
                    label: (
                      <div>
                        <FaBookmark /> Bookmark
                      </div>
                    ),
                    onClick: () => addBookmark({ variables: { id } }),
                  },
                  {
                    label: (
                      <div>
                        <MdEmail /> Mail
                      </div>
                    ),
                    onClick: () => emailPdf(name),
                  },
                ]
          }
        >
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  return (
    <div>
      <BreadCrumb
        crumbs={
          history.location.pathname.includes("resources/")
            ? [
                ["/risk-and-control", "Risk and Controls"],
                ...breadcrumb,
                ["/risk-and-control/" + id, name],
                ["/risk-and-control/" + resourceId, resourceName],
              ]
            : [
                ["/risk-and-control", "Risk and Controls"],
                ...breadcrumb,
                ["/risk-and-control/" + id, name],
              ]
        }
      />
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton
          heading={currentUrl.includes("resources/") ? resourceName : name}
        />
        {currentUrl.includes("resources/") ? null : renderActions()}
      </div>
      <Nav tabs className="tabs-pwc">
        {!currentUrl.includes("resources/") &&
          tabs.map((tab, index) => (
            <NavItem key={index}>
              <NavLink
                exact
                to={tab.to}
                className="nav-link"
                activeClassName="active"
              >
                {tab.title}
              </NavLink>
            </NavItem>
          ))}
      </Nav>
      {renderResourceDetails()}

      <TabContent>
        <TabPane>
          <Route
            exact
            path="/risk-and-control/:id/flowchart"
            render={() => (
              <Flowcharts
                history={history.location.pathname}
                bpId={id}
                loading={loadingResources}
                resources={resources.filter((resource) =>
                  resource.category?.match(/flowchart/gi)
                )}
              />
            )}
          />
          <Route exact path="/risk-and-control/:id">
            <Collapsible
              title="Risks"
              show={collapse.includes("Risks")}
              onClick={toggleCollapse}
            >
              {risks.length ? (
                <ul>
                  {risks.map((risk) => (
                    <li key={risk.id}>
                      <div className="mb-3 d-flex justify-content-between">
                        <h5>
                          {risk.name}
                          <Badge
                            color={`${getRiskColor(risk.levelOfRisk)} mx-3`}
                          >
                            {startCase(risk.levelOfRisk || "")}
                          </Badge>
                          <Badge color="secondary">
                            {startCase(risk.typeOfRisk || "")}
                          </Badge>
                        </h5>
                        {(isAdmin || isAdminPreparer) && (
                          <Button
                            onClick={() =>
                              editRisk({
                                id: risk.id,
                                name: risk.name || "",
                                businessProcessIds:
                                  risk.businessProcesses?.map(toLabelValue) ||
                                  [],
                                levelOfRisk: risk.levelOfRisk as LevelOfRisk,
                                typeOfRisk: risk.typeOfRisk as TypeOfRisk,
                              })
                            }
                            color=""
                          >
                            <FaPencilAlt />
                          </Button>
                        )}
                      </div>

                      {risk.controls?.length ? (
                        <>
                          <h6>Control</h6>
                          <ControlsTable
                            controls={risk.controls}
                            editControl={editControl}
                          />
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyAttribute />
              )}
            </Collapsible>{" "}
            {/* <Collapsible
              title="Controls"
              show={collapse.includes("Controls")}
              onClick={toggleCollapse}
            >
              {controls.length ? (
                <ControlsTable controls={controls} editControl={editControl} />
              ) : (
                <EmptyAttribute></EmptyAttribute>
              )}
            </Collapsible> */}
          </Route>
          <Route exact path="/risk-and-control/:id/resources">
            <ResourcesTab
              setResourceId={setResourceId}
              bPId={id}
              risksnControls
              isDraft={null}
              formDefaultValues={{
                category: { label: "Flowchart", value: "Flowchart" },
                businessProcessId: { label: name, value: id },
              }}
              queryFilters={{
                business_process_id_in: id,
              }}
            />
          </Route>
        </TabPane>
      </TabContent>

      <Modal isOpen={riskModal} toggle={toggleRiskModal} title="Edit Risk">
        <RiskForm
          defaultValues={risk}
          onSubmit={handleUpdateRisk}
          submitting={updateRiskM.loading}
        />
      </Modal>

      <Modal
        isOpen={controlModal}
        toggle={toggleControlModal}
        title="Edit Control"
      >
        <ControlForm
          defaultValues={control}
          onSubmit={handleUpdateControl}
          submitting={updateControlM.loading}
        />
      </Modal>
    </div>
  );
}

interface RiskState extends RiskFormValues {
  id: string;
}

interface ControlState extends ControlFormValues {
  id: string;
}

const ControlsTable = ({
  controls,
  editControl,
}: {
  controls: Control[];
  editControl: Function;
}) => {
  const assertionAndIpoModifier = (data: any) => {
    let finalData: any = data;
    const existence_and_occurence = finalData.findIndex(
      (a: any) => a === "existence_and_occurence"
    );
    const cut_over = finalData.findIndex((a: any) => a === "cut_over");
    const rights_and_obligation = finalData.findIndex(
      (a: any) => a === "rights_and_obligation"
    );
    const presentation_and_disclosure = finalData.findIndex(
      (a: any) => a === "presentation_and_disclosure"
    );
    const accuracy = finalData.findIndex((a: any) => a === "accuracy");
    const completeness = finalData.findIndex((a: any) => a === "completeness");
    const validation = finalData.findIndex((a: any) => a === "validation");
    const restriction = finalData.findIndex((a: any) => a === "restriction");

    if (existence_and_occurence !== -1) {
      finalData[existence_and_occurence] = "E/O ";
    }
    if (cut_over !== -1) {
      finalData[cut_over] = "CO";
    }
    if (rights_and_obligation !== -1) {
      finalData[rights_and_obligation] = "R&O";
    }
    if (presentation_and_disclosure !== -1) {
      finalData[presentation_and_disclosure] = "P&D";
    }
    if (accuracy !== -1) {
      finalData[accuracy] = "A";
    }
    if (completeness !== -1) {
      finalData[completeness] = "C";
    }
    if (validation !== -1) {
      finalData[validation] = "V";
    }
    if (restriction !== -1) {
      finalData[restriction] = "R";
    }
    return finalData.join(", ");
  };
  const [isAdmin, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_preparer",
  ]);
  return (
    <div className="table-responsive">
      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Freq</th>
            <th>Type of Control</th>
            <th>Nature</th>
            <th>Assertion</th>
            <th>IPO</th>
            <th>Control Owner</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {controls?.length ? (
            controls?.map((control) => (
              <tr key={control.id}>
                <td>{control.description}</td>
                <td>{startCase(control.frequency || "")}</td>
                <td>{startCase(control.typeOfControl || "")}</td>
                <td>{startCase(control.nature || "")}</td>
                <td>{assertionAndIpoModifier(control.assertion)}</td>
                <td>{assertionAndIpoModifier(control.ipo)}</td>
                <td>{control.controlOwner}</td>
                <td>
                  {(isAdmin || isAdminPreparer) && (
                    <Button
                      onClick={() =>
                        editControl({
                          id: control.id,
                          assertion: control.assertion as Assertion[],
                          controlOwner: control.controlOwner || "",
                          description: control.description || "",
                          status: control.status as Status,
                          typeOfControl: control.typeOfControl as TypeOfControl,
                          nature: control.nature as Nature,
                          ipo: control.ipo as Ipo[],
                          businessProcessIds:
                            control?.businessProcesses?.map(({ id }) => id) ||
                            [],
                          frequency: control.frequency as Frequency,
                          keyControl: control.keyControl || false,
                          riskIds: control?.risks?.map(({ id }) => id) || [],
                          activityControls: control.activityControls,
                        })
                      }
                      color=""
                    >
                      <FaPencilAlt />
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                <EmptyAttribute />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};
