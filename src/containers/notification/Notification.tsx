import { NetworkStatus } from "apollo-boost";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash, FaUndo } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { Container, Input, Form, Col, Row } from "reactstrap";
import {
  DestroyBulkNotificationInput,
  useDestroyBulkNotificationMutation,
  useIsReadMutation,
  useNotificationsQuery,
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import Pagination from "../../shared/components/Pagination";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import { date as formatDate } from "../../shared/formatter";
import useListState from "../../shared/hooks/useList";
import humanizeDate from "../../shared/utils/humanizeDate";
import { notifyError } from "../../shared/utils/notif";
import { useForm } from "react-hook-form";
import Select from "react-select";
import useAccessRights from "../../shared/hooks/useAccessRights";
import NotificationSettings from "../settings/NotificationSettings";
import Footer from "../../shared/components/Footer";
import CheckBox from "../../shared/components/forms/CheckBox";
import PickIcon from "../../assets/Icons/PickIcon";

const Notification = ({ history }: RouteComponentProps) => {
  const [labelTime, setLabelTime] = useState("Date added...");

  const time = [
    { label: "All Time" || "Date added...", value: 1 },
    { label: "Today", value: 2 },
    { label: "In 7 days", value: 3 },
    { label: "In a month", value: 4 },
    { label: "In 90 days", value: 5 },
    { label: "In a year", value: 6 },
  ];
  const aDay = 86400000;
  const aWeek = 604800000;
  const aMonth = 2592000000;
  const threeMonths = 7776000000;
  const aYear = 31536000000;

  function constructDateFilter(input: any) {
    if (!input || input === "All Time" || input === "Date added...")
      return null;
    const presentDate = new Date().getTime();
    const subtractor =
      input === "Today"
        ? aDay
        : input === "In 7 days"
        ? aWeek
        : input === "In a month"
        ? aMonth
        : input === "In 90 days"
        ? threeMonths
        : input === "In a year"
        ? aYear
        : 0;
    return new Date(presentDate - subtractor).toUTCString();
  }
  const notificationForm = useForm();
  const { limit, page, handlePageChange } = useListState({
    limit: 10,
    page: 1,
  });
  const [selected, setSelected] = useState<string[]>([]);

  const [filter, setFilter] = useState({});
  const onSubmit = (values: any) => {
    if (values.notif.toLowerCase() === "system") {
      setFilter({
        is_general_eq: true,
        created_at_gteq: constructDateFilter(labelTime),
      });
    } else {
      setFilter({
        title_or_originator_type_or_sender_user_name_cont: values.notif,
        created_at_gteq: constructDateFilter(labelTime),
      });
    }
  };

  const { data, loading, networkStatus } = useNotificationsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter,
      limit,
      page,
    },
  });
  const notifications = data?.notifications?.collection || [];
  const totalCount = data?.notifications?.metadata?.totalCount || 0;
  const [destroyNotifs, destroyNotifsM] = useDestroyBulkNotificationMutation({
    onCompleted: () => {
      toast.success("Delete Success");
      onDeleteComplete();
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["notifications", "notificationsCount"],
    awaitRefetchQueries: true,
  });
  const [isRead] = useIsReadMutation({
    refetchQueries: ["notifications", "notificationsCount"],
    awaitRefetchQueries: true,
  });

  async function redirect(type: string, id: number | string, notifId: string) {
    try {
      await isRead({
        variables: { input: { id: String(notifId) } },
      });

      if (type === "Policy") history.push(`/policy/${id}/details`);
      else if (type === "BusinessProcess")
        history.push(`/business-process/${id}`);
      else if (type === "Control") history.push(`/control/${id}`);
      else if (type === "Risk") history.push(`/risk/${id}`);
      else if (type === "User") history.push(`/user`);
      else if (type === "PolicyCategory")
        history.push(`/policy-category/${id}`);
      else if (type === "Resource") history.push(`/resources/${id}`);
    } catch (error) {
      notifyError("Item does not exist");
    }
  }

  const handleDelete = () => {
    const notifIds: DestroyBulkNotificationInput = { ids: selected };
    destroyNotifs({
      variables: { input: notifIds },
    });
  };

  function onDeleteComplete() {
    setSelected([]);
  }

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
      setSelected(notifications.map((n) => String(n.id)));
    } else {
      setSelected([]);
    }
  }
  const handleChange = (props: any) => {
    setLabelTime(props.label);
  };
  const handleReset = () => {
    setLabelTime("Date added...");
  };
  const [isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdminReviewer || isAdminPreparer);
  return (
    <div>
      <Helmet>
        <title>Notifications - PricewaterhouseCoopers</title>
      </Helmet>

      <Container fluid className="p-md-5 ">
        <h2 style={{ fontSize: "23px" }} className="mb-5">
          Notifications Manager
        </h2>
        {NotificationSettings()}
        <Row className="mt-3">
          <Col xs={12} lg={12}>
            <Form onSubmit={notificationForm.handleSubmit(onSubmit)}>
              <Row>
                <Col xs={12} md={4} className="mb-1">
                  <Input
                    placeholder="Search notifications..."
                    name="notif"
                    innerRef={notificationForm.register}
                  />
                </Col>
                <Col xs={12} md={2} className="mb-1">
                  <Select
                    options={time}
                    name="date"
                    onChange={handleChange}
                    placeholder={"Date added..."}
                    value={[{ label: labelTime, value: 1 }]}
                  />
                </Col>
                <Col xs={12} md={4} className="text-right text-md-left">
                  <Tooltip description="Reset Search">
                    <Button
                      type="reset"
                      className="soft red"
                      color=""
                      onClick={handleReset}
                    >
                      <PickIcon name="reloadOrange" />
                    </Button>
                  </Tooltip>
                  <Button
                    loading={loading}
                    type="submit"
                    className="pwc ml-1"
                    color="primary"
                  >
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>

        <Row className="mt-4 mt-md-1">
          <Col>
            <div className="text-right">
              <Tooltip description="Delete Selected Notification(s)">
                <DialogButton
                  className="soft red"
                  loading={destroyNotifsM.loading}
                  onConfirm={() => handleDelete()}
                  disabled={!selected.length}
                >
                  <PickIcon name="trash" className="clickable" />
                </DialogButton>
              </Tooltip>
            </div>
          </Col>
        </Row>
        <div style={{ minHeight: "70vh" }}>
          <div className="table-responsive mt-1">
            <Table
              loading={networkStatus === NetworkStatus.loading}
              reloading={networkStatus === NetworkStatus.setVariables}
            >
              <thead>
                <tr>
                  <th>
                    <CheckBox
                      checked={
                        selected.length === notifications.length ? true : false
                      }
                      onClick={() => {
                        clickButton();
                        toggleCheckAll();
                      }}
                    />
                  </th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th style={{ width: "10%" }}>Date added</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((data) => {
                  let dataType: string = "";

                  switch (data.dataType) {
                    case "request_edit":
                      dataType = "edit";
                      break;
                    case "request_draft":
                      dataType = "approve";
                      break;
                    default:
                      break;
                  }

                  return data ? (
                    <tr
                      key={String(data.id)}
                      onClick={() =>
                        data.originatorType
                          ? redirect(
                              data.originatorType,
                              data.originatorId || "",
                              data.id || ""
                            )
                          : null
                      }
                    >
                      <td>
                        <CheckBox
                          checked={selected.includes(String(data.id))}
                          onClick={(e: any) => {
                            e.stopPropagation();
                            toggleCheck(String(data.id));
                          }}
                        />
                      </td>
                      <td
                        className={data.isRead ? "" : "text-orange text-bold"}
                      >
                        {data.senderUserActualName}
                      </td>
                      <td
                        className={data.isRead ? "" : "text-orange text-bold"}
                      >
                        {/* isAdminReviewer */}

                        {isAdminReviewer
                          ? data.dataType === "request_draft" ||
                            data.dataType === "request draft"
                            ? `Action required: [${
                                data.senderUserActualName
                              }] has requested for approval for [${
                                data.title?.includes(" Has Been Submitted")
                                  ? data.title.split(" Has Been Submitted")[0]
                                  : data.title?.includes(
                                      data.senderUserActualName || ""
                                    )
                                  ? data.title
                                      .split(
                                        data.senderUserActualName + " " || ""
                                      )[1]
                                      .includes("Create a User with email")
                                    ? data.title
                                        .split(
                                          data.senderUserActualName + " " || ""
                                        )[1]
                                        .split("Create a User with email ")[1]
                                    : data.title
                                  : data.title
                              }]`
                            : data.dataType === "request_edit"
                            ? `Action required: [${data.senderUserActualName}] has requested for edit for [${data.title}]`
                            : data.title
                          : null}

                        {/* isAdminPreparer */}
                        {isAdminPreparer || isUser
                          ? data.dataType === "request_draft_approved" ||
                            data.dataType === "request_draft_rejected"
                            ? `[${
                                data.dataType === "request_draft_approved"
                                  ? data.title?.split(" Approved")[0]
                                  : data.title?.split(" Rejected")[0]
                              }] has been [${
                                data.dataType === "request_draft_approved"
                                  ? `Approved`
                                  : `Rejected`
                              }]`
                            : data.dataType === "request_edit_approved" ||
                              data.dataType === "request_edit_rejected"
                            ? `Your request for edit has been [${
                                data.dataType === "request_edit_approved"
                                  ? "Approved"
                                  : "Rejected"
                              }]`
                            : data.dataType === "related_reference"
                            ? data.title
                            : data.title
                          : null}
                        {/* {isAdminReviewer &&
                        `Action required: [${
                          data.senderUserActualName
                        }] has requested for ${
                          data.dataType !== "request_draft"
                            ? "edit"
                            : "approval"
                        } for ${data.title}`}
                      {isAdminPreparer && data.dataType?.includes("request")
                        ? `Notification: [${data.title
                            ?.split(" ")
                            .filter((c) => c !== "Approved")
                            .join(" ")
                            .replace(" Has been Rejected", "")}] has been ${
                            data.title?.includes("Approve")
                              ? "[Approved]"
                              : "[Rejected]"
                          }
                        `
                        : isAdminPreparer &&
                          data.title?.includes("with") &&
                          data.title?.includes("i.e.: ") &&
                          `Notification: ${data.title
                            ?.replace(
                              `${data.title.split("with")[0]}`,
                              `[${data.title.split("with")[0]}] `
                            )
                            .replace(
                              `${data.title.split("i.e.: ")[1]}`,
                              `${data.title
                                .split("i.e.: ")[1]
                                .split(", ")
                                .map((a) => `[${a}]`)
                                .join(", ")}`
                            )
                            .replace(
                              `${data.title.split("with")[1].split(" ")[1]}`,
                              `[${data.title.split("with")[1].split(" ")[1]}]`
                            )}`} */}
                      </td>
                      <td className={data.isRead ? "" : "text-orang text-bold"}>
                        <div>{humanizeDate(data.createdAt)}</div>
                        <span className="text-secondary">
                          {formatDate(data.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </Table>
          </div>
          <Pagination
            totalCount={totalCount}
            perPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
        <Footer />
      </Container>
    </div>
  );
};
export default Notification;
