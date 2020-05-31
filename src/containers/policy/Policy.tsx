import get from "lodash/get";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import Helmet from "react-helmet";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit,
} from "react-icons/ai";
import {
  FaBars,
  FaBookmark,
  FaEllipsisV,
  FaExclamationCircle,
  FaFilePdf,
  FaMinus,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import Table from "../../shared/components/Table";
import { IoMdDownload, IoMdOpen } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Route, RouteComponentProps } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { Badge, Nav, NavItem, TabContent, TabPane, Row, Col } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useApproveRequestEditMutation,
  useCreateBookmarkPolicyMutation,
  useCreateRequestEditMutation,
  useDestroyPolicyMutation,
  usePolicyQuery,
  useReviewPolicyDraftMutation,
  useSubmitPolicyMutation,
  useUpdateDraftPolicyMutation,
  useReferencesQuery,
  usePolicyCategoriesQuery,
  useBookmarksQuery,
  useResourceQuery,
  useResourceRatingsQuery,
  useRiskQuery,
  useControlQuery,
  // useUpdatePolicyMutation,
} from "../../generated/graphql";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import ControlsTable from "../../shared/components/ControlsTable";
import DateHover from "../../shared/components/DateHover";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu, { MenuData } from "../../shared/components/Menu";
import PoliciesTable from "../../shared/components/PoliciesTable";
import ResourcesTab from "../../shared/components/ResourcesTab";
import RisksList from "../../shared/components/RisksList";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useDialogBox from "../../shared/hooks/useDialogBox";
import useWindowSize from "../../shared/hooks/useWindowSize";
import {
  downloadPdf,
  emailPdf,
  previewPdf,
} from "../../shared/utils/accessGeneratedPdf";
import { formatPolicyChart } from "../../shared/utils/formatPolicy";
import {
  notifyError,
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import PolicyDashboard from "./components/PolicyDashboard";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";
import { toLabelValue } from "../../shared/formatter";
import ResourceBox from "../resources/components/ResourceBox";
import { useSelector } from "../../shared/hooks/useSelector";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import { APP_ROOT_URL } from "../../settings";
import getRiskColor from "../../shared/utils/getRiskColor";
import startCase from "lodash/startCase";
import { capitalCase } from "capital-case";

type TParams = { id: string };

export default function Policy({
  match,
  history,
  location,
}: RouteComponentProps<TParams>) {
  const currentUrl = history.location.pathname;
  const dialogBox = useDialogBox();
  const size = useWindowSize();
  const isSmallDevice = size.width <= 992;
  const subPolicyRef = useRef<HTMLInputElement>(null);
  const riskRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLInputElement>(null);
  const initialCollapse = ["Resources", "Risks", "Controls", "Sub-Policies"];
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

  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode((prev) => !prev);
  useEffect(() => {
    setInEditMode((p) => (p ? false : p));
  }, [location.pathname]);

  const { id } = match.params;

  const { loading, data } = usePolicyQuery({
    variables: { id, withChild: true },
    fetchPolicy: "network-only",
    pollInterval: 30000,
  });
  const referenceData = useReferencesQuery({
    fetchPolicy: "network-only",
    variables: { filter: { policies_id_matches_any: id } },
  });
  const { data: bookmarkData, loading: bookmarkLoading } = useBookmarksQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: { originator_id_eq: id, originator_type_eq: "Policy" },
    },
  });
  const policyCategoriesData = usePolicyCategoriesQuery({
    variables: { filter: { policies_id_matches_any: id } },
  });

  const references = oc(referenceData)
    .data.navigatorReferences.collection([])
    .map(toLabelValue);
  const referenceIds = references.map((a) => a.value);

  const policyCategories = oc(policyCategoriesData)
    .data.navigatorPolicyCategories.collection([])
    .map(toLabelValue);
  const policyCategoryId = policyCategories.map((a) => a.value).pop() || "";
  const isDraft = data?.policy?.draft;
  const isAdminView = location.pathname.split("/")[1] === "policy-admin";
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const scrollToRisk = useCallback(
    () =>
      window.scrollTo({
        top: riskRef.current ? riskRef.current.offsetTop : 0,
        behavior: "smooth",
      }),
    []
  );
  const scrollToSubPolicy = useCallback(
    () =>
      window.scrollTo({
        top: subPolicyRef.current ? subPolicyRef.current.offsetTop : 0,
        behavior: "smooth",
      }),
    []
  );
  const scrollToControl = useCallback(
    () =>
      window.scrollTo({
        top: controlRef.current ? controlRef.current.offsetTop : 0,
        behavior: "smooth",
      }),
    []
  );

  useLayoutEffect(() => {
    if (location.hash.includes("risks")) {
      scrollToRisk();
    }
    if (location.hash.includes("controls")) {
      scrollToControl();
    }
    if (location.hash.includes("sub-policies")) {
      scrollToSubPolicy();
    }
  });

  // Delete current policy
  const [destroyMain] = useDestroyPolicyMutation({
    onCompleted: () => {
      const url = isAdminView ? "/policy-admin" : "/policy";
      notifySuccess("Delete Success");
      history.push(url);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "policies",
      "policyCategories",
      "adminPolicyCategories",
      "reviewerPolicyCategoriesStatus",
      "preparerPolicies",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
    ],
    awaitRefetchQueries: true,
  });
  function handleDeleteMain() {
    dialogBox({
      text: "Delete this policy?",
      callback: () => destroyMain({ variables: { id } }),
    });
  }

  // Delete child policy
  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => notifySuccess("Delete Success"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["policy"],
    awaitRefetchQueries: true,
  });
  function handleDelete(id: string, title?: string) {
    dialogBox({
      text: `Delete policy "${title}"?`,
      callback: () => destroy({ variables: { id } }),
    });
  }

  // Bookmark policy
  const [addBookmark] = useCreateBookmarkPolicyMutation({
    onCompleted: (_) => notifySuccess("Added to bookmark"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["policy", "bookmarks"],
    awaitRefetchQueries: true,
  });

  // const [update, updateState] = useUpdatePolicyMutation({
  //   onCompleted: () => {
  //     notifySuccess("Update Success");
  //     toggleEditMode();
  //   },
  //   onError: notifyGraphQLErrors,
  //   refetchQueries: ["policies", "policyTree", "policy"],
  //   awaitRefetchQueries: true
  // });
  // function handleUpdate(values: PolicyFormValues) {
  //   update({ variables: { input: { id, ...values } } });
  // }
  // function handleUpdateSubPolicy(values: SubPolicyFormValues) {
  //   update({ variables: { input: { id, ...values } } });
  // }
  // Update Policy As Draft
  const [updateDraft, updateDraftState] = useUpdateDraftPolicyMutation({
    onCompleted: () => {
      notifySuccess("Update Success");
      toggleEditMode();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "policies",
      "preparerPolicies",
      "policyCategories",
      "reviewerPolicyCategoriesStatus",
      "adminPolicyCategories",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
      "policy",
    ],
    awaitRefetchQueries: true,
  });
  function handleUpdateDraft(values: PolicyFormValues) {
    updateDraft({ variables: { input: { id, ...values } } });
  }
  function handleUpdateDraftSubPolicy(values: SubPolicyFormValues) {
    updateDraft({
      variables: { input: { id, ...values, parentId: data?.policy?.ancestry } },
    });
  }

  // Submit to reviewer
  const [submit, loadingSubmit] = useSubmitPolicyMutation({
    onCompleted: () => {
      notifySuccess("Submitted");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["policy"],
  });
  function handleSubmit(values: PolicyFormValues) {
    submit({ variables: { input: { id, ...values } } });
    setInEditMode(!inEditMode);
  }
  function handleSubmitSubPolicy(values: SubPolicyFormValues) {
    submit({ variables: { input: { id, ...values } } });
    setInEditMode(!inEditMode);
  }
  function handleSubmitSubPolicySecond(values: SubPolicyFormValues) {
    submit({
      variables: { input: { id, ...values, parentId: data?.policy?.ancestry } },
    });
    setInEditMode(!inEditMode);
  }
  const [
    requestEditMutation,
    requestEditMutationInfo,
  ] = useCreateRequestEditMutation({
    variables: { id: oc(data).policy.id(""), type: "Policy" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["policy"],
  });

  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    refetchQueries: [
      "policy",
      "preparerPolicies",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
    ],
    awaitRefetchQueries: true,
  });
  async function handleApproveRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: true } });
      notifySuccess("You Gave Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  async function handleRejectRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: false } });
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  const [reviewPolicy, reviewPolicyM] = useReviewPolicyDraftMutation({
    refetchQueries: [
      "policy",
      "preparerPolicies",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
    ],
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewPolicy({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Accepted" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  const isSubmitted = data?.policy?.isSubmitted;
  const draft = data?.policy?.draft?.objectResult;
  const title = data?.policy?.title || "";
  const description = draft
    ? get(data, "policy.draft.objectResult.description", "")
    : data?.policy?.description || "";
  const hasEditAccess = oc(data).policy.hasEditAccess();
  const parentId = oc(data).policy.parentId("");
  const children = oc(data).policy.children([]);
  const isSubPolicy: boolean = !!oc(data).policy.ancestry();
  const ancestry = oc(data).policy.ancestry("");
  const policyReferences = data?.policy?.references || [];
  const controlCount = oc(data).policy.controlCount({});
  const riskCount = oc(data).policy.riskCount({});
  const subCount = oc(data).policy.subCount({});
  const isMaximumLevel = ancestry.split("/").length === 5;
  const ancestors = data?.policy?.ancestors || [];
  const lastUpdatedAt = data?.policy?.lastUpdatedAt;
  const bookmarked = bookmarkData?.bookmarks?.collection || [];
  const createdAt = data?.policy?.createdAt;
  const createdBy = data?.policy?.createdBy;
  const trueVersion = data?.policy?.trueVersion;

  //resource Bar
  const [resourceId, setResourceId] = useState("");
  const userId = useSelector((state) => state.auth.user)?.id;
  useEffect(() => {
    if (currentUrl.includes("resources/")) {
      setResourceId(currentUrl.split("resources/")[1]);
    }
  }, [currentUrl]);
  const { data: dataResource, loading: loadingResource } = useResourceQuery({
    skip: !resourceId,
    variables: { id: resourceId },
    fetchPolicy: "network-only",
  });
  const { data: dataRating } = useResourceRatingsQuery({
    skip: !resourceId,
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
      <Route exact path="/policy/:id/resources/:id">
        <div>
          {loadingResource ? (
            <LoadingSpinner centered size={30} />
          ) : (
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
                          <Link to={`/business-process/${businessProcess?.id}`}>
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
                                  <li key={control.id}>
                                    {control.description}
                                  </li>
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
          )}
        </div>
      </Route>
    );
  };

  //Risk bar

  const [riskId, setRiskId] = useState("");
  useEffect(() => {
    if (currentUrl.includes("/risk/")) {
      setRiskId(currentUrl.split("/risk/")[1]);
    }
  }, [currentUrl]);
  const { data: dataRisk, loading: loadingRisk } = useRiskQuery({
    skip: !riskId,
    variables: { id: riskId },
    fetchPolicy: "network-only",
  });
  const riskName = dataRisk?.risk?.name || "";

  const renderRiskDetails = () => {
    const levelOfRisk = dataRisk?.risk?.levelOfRisk || "";
    const typeOfRisk = dataRisk?.risk?.typeOfRisk || "";
    const bps = dataRisk?.risk?.businessProcess;
    const updatedAt = dataRisk?.risk?.updatedAt;
    const updatedBy = dataRisk?.risk?.lastUpdatedBy;
    const createdBy = dataRisk?.risk?.createdBy;
    const status = dataRisk?.risk?.status;
    const createdAt = dataRisk?.risk?.createdAt;

    const details1 = [
      { label: "Risk Id", value: id },
      { label: "Name", value: riskName },
      {
        label: "Business Process",
        value: bps?.join(", "),
      },
      {
        label: "Level of Risk",
        value: (
          <Badge color={getRiskColor(levelOfRisk)}>
            {startCase(levelOfRisk)}
          </Badge>
        ),
      },
      {
        label: "Type of Risk",
        value: <Badge color="secondary">{startCase(typeOfRisk)}</Badge>,
      },
    ];
    const details2 = [
      {
        label: "Last Updated",
        value: updatedAt?.split(" ")[0],
      },
      {
        label: "Updated By",
        value: updatedBy,
      },
      {
        label: "Created At",
        value: createdAt?.split(" ")[0],
      },
      {
        label: "Created By",
        value: createdBy,
      },
      {
        label: "Status",
        value: status,
      },
    ];
    return (
      <Route exact path="/policy/:id/details/risk/:id">
        {loadingRisk ? (
          <LoadingSpinner centered size={30} />
        ) : (
          <Row>
            <Col xs={6}>
              <dl>
                {details1.map((item) => (
                  <Fragment key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value || "-"}</dd>
                  </Fragment>
                ))}
              </dl>
            </Col>
            <Col xs={6}>
              {details2.map((item) => (
                <Fragment key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value || "-"}</dd>
                </Fragment>
              ))}
            </Col>
          </Row>
        )}
      </Route>
    );
  };

  //control Bar

  const [controlId, setControlId] = useState("");
  useEffect(() => {
    if (currentUrl.includes("/control/")) {
      setControlId(currentUrl.split("/control/")[1]);
    }
  }, [currentUrl]);
  const { loading: loadingControl, data: dataControl } = useControlQuery({
    skip: !controlId,
    fetchPolicy: "network-only",
    variables: { id: controlId },
  });
  const descriptionControl = dataControl?.control?.description || "";

  const renderControlDetails = () => {
    const updatedAt = dataControl?.control?.updatedAt
      ? dataControl?.control?.updatedAt.split(" ")[0]
      : "";
    const lastUpdatedBy = dataControl?.control?.lastUpdatedBy || "";
    const createdBy = dataControl?.control?.createdBy || "";
    const assertion = dataControl?.control?.assertion || [];
    const frequency = dataControl?.control?.frequency || "";
    const ipo = dataControl?.control?.ipo || [];
    const typeOfControl = dataControl?.control?.typeOfControl || "";
    const status = dataControl?.control?.status || "";
    const keyControl = dataControl?.control?.keyControl || false;
    const risks = dataControl?.control?.risks || [];
    const businessProcesses = dataControl?.control?.businessProcesses || [];
    const activityControls = dataControl?.control?.activityControls || [];
    const createdAt = dataControl?.control?.createdAt || "";
    const departments = dataControl?.control?.departments || [];
    const filteredNames = (names: any) =>
      names.filter((v: any, i: any) => names.indexOf(v) === i);
    const details = [
      { label: "Control ID", value: id },
      { label: "Description", value: descriptionControl },

      {
        label: "Control Owner",
        value: departments.map((a: any) => a.name).join(", "),
      },
      {
        label: "Key Control",
        value: (
          <input type="checkbox" checked={keyControl} onChange={() => {}} />
        ),
      },
      { label: "Type of Control", value: capitalCase(typeOfControl) },
      {
        label: "Assertion",
        value: assertion.map((x) => capitalCase(x)).join(", "),
      },
      {
        label: "IPO",
        value: ipo.map((x) => capitalCase(x)).join(", "),
      },
      { label: "Frequency", value: capitalCase(frequency) },
      { label: "Status", value: capitalCase(status) },
      { label: "Last Updated", value: updatedAt },
      { label: "Last Updated By", value: lastUpdatedBy },
      { label: "Created At", value: createdAt.split(" ")[0] },
      { label: "Created By", value: createdBy },
    ];
    return (
      <Route exact path="/policy/:id/details/control/:id">
        {loadingControl ? (
          <LoadingSpinner centered size={30} />
        ) : (
          <Row>
            <Col xs={6}>
              <dl>
                {details.slice(0, Math.ceil(details.length / 2)).map((item) => (
                  <Fragment key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value || "-"}</dd>
                  </Fragment>
                ))}
              </dl>
            </Col>
            <Col xs={6}>
              <dl>
                {details
                  .slice(Math.ceil(details.length / 2), details.length)
                  .map((item) => (
                    <Fragment key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value || "-"}</dd>
                    </Fragment>
                  ))}
              </dl>
            </Col>

            <Col xs={12} className="mt-3">
              <h5>Risks</h5>
              {risks.length ? (
                filteredNames(risks).map((risk: any) => (
                  <p key={risk.id}>{risk.name}</p>
                ))
              ) : (
                <EmptyAttribute />
              )}
              <h5 className="mt-2">Business Processes</h5>
              {businessProcesses.length ? (
                filteredNames(businessProcesses).map((bp: any) => (
                  <p key={bp.id}>{bp.name}</p>
                ))
              ) : (
                <EmptyAttribute />
              )}
            </Col>

            {activityControls.length > 0 ? (
              <Col xs={7} className="mt-2">
                <h5>Control Activities</h5>
                <Table>
                  <thead>
                    <tr>
                      <th>Control Activity</th>
                      <th>Guidance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityControls.map((activity) => (
                      <tr key={"Row" + activity.id}>
                        <td>{activity.activity}</td>
                        <td>
                          {activity.guidance ? (
                            activity.guidance
                          ) : (
                            <div className="d-flex align-items-center ">
                              <Button color="" className="soft orange">
                                <a
                                  href={`http://mandalorian.rubyh.co${activity.guidanceResuploadUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={`Pwc-ActivityControl ${activity.guidanceFileName}`}
                                  className="text-orange"
                                >
                                  <span className="mr-2">
                                    {activity.guidanceFileName}
                                  </span>
                                  <IoMdOpen />
                                </a>
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            ) : null}
          </Row>
        )}
      </Route>
    );
  };
  const breadcrumb = ancestors.map((a: any) => [
    "/policy/" + a.id,
    a.title,
  ]) as CrumbItem[];
  if (loading) return <LoadingSpinner centered size={30} />;
  const policyChartData = formatPolicyChart({
    controlCount,
    riskCount,
    subCount,
  }).map((item) => ({
    ...item,
    onClick: item.label.includes("Risk")
      ? () => history.push(`${location.pathname}/details/#risks`)
      : item.label.includes("Control")
      ? () => history.push(`${location.pathname}/details/#controls`)
      : () => history.push(`${location.pathname}/details/#sub-policies`),
  }));
  const renderPolicy = () => {
    const tabs = isAdminView
      ? [{ to: `/policy-admin/${id}/details`, title: "Details" }]
      : [
          { to: `/policy/${id}`, title: "Dashboard" },
          { to: `/policy/${id}/details`, title: "Details" },
          { to: `/policy/${id}/resources`, title: "Resources" },
        ];
    return (
      <div>
        {currentUrl.includes("/resources/") ||
        currentUrl.includes("/details/") ? null : (
          <Nav tabs className="tabs-pwc">
            {tabs.map((tab, index) => (
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
        )}

        <TabContent>
          <TabPane>
            <Route exact path="/policy/:id">
              <div className="mb-3 py-3">
                <PolicyDashboard data={policyChartData} />
              </div>
            </Route>
            <Route
              exact
              path={
                isAdminView
                  ? "/policy-admin/:id/details"
                  : "/policy/:id/details"
              }
            >
              <div className="text-right my-2 text-secondary">
                <div className="mb-1  ">Created By : {createdBy}</div>
                {lastUpdatedAt ? (
                  <DateHover withIcon>{lastUpdatedAt}</DateHover>
                ) : (
                  <div className="text-secondary">
                    <DateHover withIcon>{createdAt}</DateHover>
                  </div>
                )}

                <div className="mt-1  ">Version : {trueVersion}</div>
              </div>
              <div className="d-flex justify-content-end">
                {renderPolicyAction()}
              </div>

              <div
                className="mb-3 py-3"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
              {policyReferences.length ? (
                <div
                  className="d-flex"
                  style={{ borderBottom: " 1px solid #d85604" }}
                >
                  <h6>
                    {policyReferences.map((reference) => (
                      <Badge key={reference.id} className="mx-1">
                        {reference.name}
                      </Badge>
                    ))}
                  </h6>
                </div>
              ) : (
                <div
                  className="d-flex"
                  style={{ borderBottom: " 1px solid #d85604" }}
                >
                  <h6>
                    {references.map((reference) => (
                      <Badge key={reference.value} className="mx-1">
                        {reference.label}
                      </Badge>
                    ))}
                  </h6>
                </div>
              )}

              <div ref={riskRef} style={{ borderBottom: " 1px solid #d85604" }}>
                <Collapsible
                  title="Risks"
                  show={collapse.includes("Risks")}
                  onClick={toggleCollapse}
                >
                  <RisksList data={data} setRiskId={setRiskId} />
                </Collapsible>
              </div>

              <div
                ref={controlRef}
                style={{ borderBottom: " 1px solid #d85604" }}
              >
                <Collapsible
                  title="Controls"
                  show={collapse.includes("Controls")}
                  onClick={toggleCollapse}
                >
                  <ControlsTable setControlId={setControlId} data={data} />
                </Collapsible>
              </div>

              <div ref={subPolicyRef}>
                <Collapsible
                  title="Sub-Policies"
                  show={collapse.includes("Sub-Policies")}
                  onClick={toggleCollapse}
                >
                  <PoliciesTable
                    policies={children}
                    isAdminView={isAdminView}
                    onDelete={handleDelete}
                  />
                </Collapsible>
              </div>
            </Route>
            <Route exact path="/policy/:id/resources">
              <ResourcesTab
                setResourceId={setResourceId}
                policyData={data}
                policy
                isDraft={isDraft}
                formDefaultValues={{
                  policyIds: [
                    {
                      value: id,
                      label: title,
                    },
                  ],
                }}
                queryFilters={{
                  policies_id_in: id,
                }}
              />
            </Route>
          </TabPane>
        </TabContent>
      </div>
    );
  };

  const renderPolicyInEditMode = () => {
    return (
      <div>
        <div className="d-flex justify-content-end">{renderPolicyAction()}</div>
        {isSubPolicy ? (
          <SubPolicyForm
            defaultValues={{
              parentId,
              title,
              description,
              referenceIds,
              resourceIds: oc(data)
                .policy.resources([])
                .map((r) => r.id),
              businessProcessIds: oc(data)
                .policy.businessProcesses([])
                .map((r) => r.id),
              controlIds: oc(data)
                .policy.controls([])
                .map((r) => r.id),
              riskIds: oc(data)
                .policy.risks([])
                .map((r) => r.id),
            }}
            saveAsDraftFirst={handleUpdateDraftSubPolicy}
            submitFirst={handleSubmitSubPolicy}
            submitSecond={handleSubmitSubPolicySecond}
            saveAsDraftSecond={handleUpdateDraftSubPolicy}
            secondDraftLoading={loadingSubmit.loading}
            toggleEditMode={toggleEditMode}
            submitting={updateDraftState.loading}
            submittingDraft={updateDraftState.loading}
            premise={
              ((isAdminPreparer && !isSubmitted) ||
                (isAdminReviewer && !isSubmitted)) &&
              !(
                (hasEditAccess && !draft && isAdminPreparer) ||
                (!draft && isSubmitted && isAdmin)
              )
            }
          />
        ) : (
          <PolicyForm
            handleSubmitToReviewer={handleSubmit}
            submitFromDraft={handleSubmit}
            loadingSubmit={loadingSubmit.loading}
            onSubmit={handleUpdateDraft}
            defaultValues={{
              title,
              policyCategoryId,
              description,
            }}
            submitting={updateDraftState.loading}
            submittingAsDraft={updateDraftState.loading}
            onSubmitAsDraft={handleUpdateDraft}
            toggleEditMode={toggleEditMode}
            premise={
              ((isAdminPreparer && !isSubmitted) ||
                (isAdminReviewer && !isSubmitted)) &&
              !(
                (hasEditAccess && !draft && isAdminPreparer) ||
                (!draft && isSubmitted && isAdmin)
              )
            }
          />
        )}
      </div>
    );
  };

  const renderGeneralAction = () => {
    const mainMenu: MenuData[] = [
      {
        label: (
          <div>
            <FaPlus /> Create Sub-Policy
          </div>
        ),
        onClick: () =>
          history.push(
            isAdminView
              ? `/policy-admin/${id}/create-sub-policy`
              : `/policy/${id}/create-sub-policy`
          ),
      },
      {
        label: (
          <div>
            <FaTrash /> Delete
          </div>
        ),
        onClick: handleDeleteMain,
      },
      { label: "divider" },
    ];
    const basicMenu: MenuData[] = bookmarked.length
      ? [
          {
            label: (
              <div>
                <FaFilePdf /> Preview
              </div>
            ),
            onClick: () =>
              previewPdf(`/prints/${id}/policy.pdf`, {
                onStart: () =>
                  notifySuccess("Downloading file for preview", {
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
            onClick: () => {
              downloadPdf(`/prints/${id}/policy.pdf`, {
                fileName: title,
                onStart: () => notifyInfo("Download Started"),
                onError: () => notifyError("Download Failed"),
                onCompleted: () => notifySuccess("Download Success"),
              });
            },
          },
          {
            label: (
              <div>
                <MdEmail /> Mail
              </div>
            ),
            onClick: () => emailPdf(title),
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
              previewPdf(`/prints/${id}/policy.pdf`, {
                onStart: () =>
                  notifySuccess("Downloading file for preview", {
                    autoClose: 10000,
                  }),
              }),
          },
          {
            label: (
              <div>
                <IoMdDownload /> download
              </div>
            ),
            onClick: () => {
              downloadPdf(`/prints/${id}/policy.pdf`, {
                fileName: title,
                onStart: () => notifyInfo("Download Started"),
                onError: () => notifyError("Download Failed"),
                onCompleted: () => notifySuccess("Download Success"),
              });
            },
          },
          {
            label: (
              <div>
                <MdEmail /> Mail
              </div>
            ),
            onClick: () => emailPdf(title),
          },
          {
            label: (
              <div>
                <FaBookmark /> Bookmark
              </div>
            ),
            onClick: () =>
              addBookmark({ variables: { input: { policyId: id } } }),
          },
        ];
    let theMenu = [...basicMenu];
    if (isSmallDevice) {
      let noCreateMenu = [...mainMenu];
      noCreateMenu[0] = { label: "create" };
      const noCreateButton = noCreateMenu.filter((a) => a.label !== "create");
      let noDeleteMenu = [...mainMenu];
      noDeleteMenu[1] = { label: "Delete" };
      const noDeleteButton = noDeleteMenu.filter((a) => a.label !== "Delete");
      theMenu = bookmarkLoading
        ? [
            {
              label: (
                <Fragment>
                  <LoadingSpinner className="mt-2 mb-2" centered />
                </Fragment>
              ),
            },
          ]
        : isAdminReviewer
        ? [...noCreateButton, ...basicMenu]
        : !(isAdminReviewer || isAdmin || isAdminPreparer)
        ? basicMenu
        : [...noDeleteButton, ...basicMenu];
    }
    return (
      <div className="d-flex align-items-center">
        <div className="d-none d-lg-flex align-items-center ">
          {!isMaximumLevel && (isAdmin || isAdminPreparer) && (
            <Button
              tag={Link}
              to={
                isAdminView
                  ? `/policy-admin/${id}/create-sub-policy`
                  : `/policy/${id}/create-sub-policy`
              }
              className="pwc "
              style={{
                marginRight: `${
                  currentUrl.includes("details") ? "0px" : "10px"
                }`,
              }}
            >
              <FaPlus /> Sub-Policy
            </Button>
          )}
          {currentUrl.includes("details") && (
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

          {isAdminReviewer && (
            <Tooltip description="Delete Policy">
              <Button
                onClick={handleDeleteMain}
                className="mr-3"
                color="transparent"
              >
                <FaTrash className="text-red" />
              </Button>
            </Tooltip>
          )}
        </div>
        <Menu data={theMenu}>
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  const renderPolicyAction = () => {
    const hasEditAccess = oc(data).policy.hasEditAccess();
    const requestStatus = oc(data).policy.requestStatus();
    const requested = requestStatus === "requested";
    const notRequested = !requestStatus;
    const rejected = requestStatus === "rejected";
    const requestEdit = oc(data).policy.requestEdit.state();
    let actions: React.ReactNode = null;
    // PREMISES
    // 1: None
    const prem1 =
      (draft && isAdminPreparer && isSubmitted) || (!draft && isAdminReviewer);
    // 2: Approve or reject
    const prem2 = draft && isSubmitted && (isAdminReviewer || isAdmin);
    // 3: User Create as draft for admin preparer
    const prem3 =
      (isAdminPreparer && !isSubmitted) || (isAdminReviewer && !isSubmitted);
    // 4: Edit
    const prem4 =
      (hasEditAccess && !draft && isAdminPreparer) ||
      (!draft && isSubmitted && isAdmin);
    // 5: Request for edit
    const prem5 = !draft && (notRequested || rejected) && isAdminPreparer;
    // 6: Waiting approval
    const prem6 = requested && isAdminPreparer;
    // 7: Accept Request to edit
    const prem7 = requestEdit === "requested" && (isAdminReviewer || isAdmin);
    if (prem1) actions = null;
    if (prem2) {
      actions = (
        <div>
          <Button
            color="danger"
            className="mr-2"
            onClick={() =>
              dialogBox({
                callback: () => review({ publish: false }),
                title: "Reject changes?",
              })
            }
            loading={reviewPolicyM.loading}
          >
            Reject
          </Button>
          <Button
            color="primary"
            className="pwc"
            onClick={() =>
              dialogBox({
                callback: () => review({ publish: true }),
                title: "Accept changes?",
              })
            }
            loading={reviewPolicyM.loading}
          >
            Approve
          </Button>
        </div>
      );
    }
    if (prem3) {
      isAdminPreparer
        ? (actions = !inEditMode ? (
            // <div className="d-flex">
            <Tooltip description="Edit Policy">
              <Button
                onClick={toggleEditMode}
                color=""
                className="soft orange mr-2"
              >
                <AiFillEdit />
              </Button>
            </Tooltip>
          ) : // </div>
          null)
        : (actions = null);
    }
    if (prem4) {
      actions = inEditMode ? null : (
        <Tooltip description="Edit Policy">
          <Button onClick={toggleEditMode} color="" className="soft orange">
            <AiFillEdit />
          </Button>
        </Tooltip>
      );
    }

    if (prem5) {
      actions = (
        <Tooltip description="Request edit access">
          <Button
            onClick={() =>
              dialogBox({
                title: "Request access to edit?",
                callback: () => requestEditMutation(),
              })
            }
            loading={requestEditMutationInfo.loading}
            className="soft red mr-2"
            color=""
            disabled={requested}
          >
            <AiOutlineEdit />
          </Button>
        </Tooltip>
      );
    }

    if (prem6) {
      actions = (
        <Tooltip
          description="Waiting approval"
          subtitle="You will be able to edit as soon as Admin gave you permission"
        >
          <Button disabled className="soft orange mr-2">
            <AiOutlineClockCircle />
          </Button>
        </Tooltip>
      );
    }

    if (prem7) {
      actions = (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${oc(data).policy.requestEdit.user.name()}`}
            className="soft red mr-2"
            data={oc(data).policy.requestEdit.id()}
            onConfirm={handleApproveRequest}
            onReject={handleRejectRequest}
            actions={{ no: "Reject", yes: "Approve" }}
            loading={approveEditMutationResult.loading}
          >
            <FaExclamationCircle />
          </DialogButton>
        </Tooltip>
      );
    }

    return actions;
  };

  return (
    <div>
      <Helmet>
        <title>{title} - Policy - PricewaterhouseCoopers</title>
      </Helmet>

      <BreadCrumb
        crumbs={
          currentUrl.includes("resources/")
            ? [
                ["/policy", "Policies"],
                ...breadcrumb,
                ["/policy/" + id, title],
                [`/policy/${id}/resources/` + resourceId, resourceName],
              ]
            : currentUrl.includes("/risk/")
            ? [
                ["/policy", "Policies"],
                ...breadcrumb,
                ["/policy/" + id, title],
                [`/policy/${id}/details/risk/` + riskId, riskName],
              ]
            : currentUrl.includes("/control/")
            ? [
                ["/policy", "Policies"],
                ...breadcrumb,
                ["/policy/" + id, title],
                [`/policy/${id}/details/risk/` + controlId, descriptionControl],
              ]
            : [["/policy", "Policies"], ...breadcrumb, ["/policy/" + id, title]]
        }
      />
      <Row className="d-flex justify-content-between">
        <Col>
          <HeaderWithBackButton
            draft={!!draft}
            policy
            review={
              isSubmitted ||
              (draft && isSubmitted && (isAdminReviewer || isAdmin)) ||
              false
            }
          >
            {currentUrl.includes("resources/")
              ? resourceName
              : currentUrl.includes("/risk/")
              ? riskName
              : currentUrl.includes("/control/")
              ? descriptionControl
              : title}
          </HeaderWithBackButton>
        </Col>
        {currentUrl.includes("/details/") || currentUrl.includes("resources/")
          ? null
          : renderGeneralAction()}
      </Row>
      {inEditMode ? renderPolicyInEditMode() : renderPolicy()}
      {renderResourceDetails()}
      {renderRiskDetails()}
      {renderControlDetails()}
    </div>
  );
}
