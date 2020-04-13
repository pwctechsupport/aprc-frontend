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
  useNotificationsQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import { date as formatDate } from "../../shared/formatter";
import Pagination from "../../shared/components/Pagination";
import useListState from "../../shared/hooks/useList";
import { notifyError } from "../../shared/utils/notif";
import { useForm } from "react-hook-form";
import Select from "react-select";

const Notification = ({ history }: RouteComponentProps) => {
  const [labelTime, setLabelTime] = useState("Date Added...");

  const time = [
    { label: "All Time" || "Date Added...", value: 1 },
    { label: "Today", value: 2 },
    { label: "In 7 days", value: 3 },
    { label: "In a month", value: 4 },
    { label: "In 90 days", value: 5 },
    { label: "In a year", value: 6 }
  ];
  const aDay = 86400000;
  const aWeek = 604800000;
  const aMonth = 2592000000;
  const threeMonths = 7776000000;
  const aYear = 31536000000;

  function constructDateFilter(input: any) {
    if (!input || input === "All Time" || input === "Date Added...")
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
    page: 1
  });
  const [selected, setSelected] = useState<string[]>([]);

  const [filter, setFilter] = useState({});
  const onSubmit = (values: any) => {
    setFilter({
      title_or_originator_type_or_sender_user_name_cont: values.notif,
      created_at_gteq: constructDateFilter(labelTime)
    });
  };

  const { data, loading, networkStatus } = useNotificationsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter,
      limit,
      page
    }
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
    awaitRefetchQueries: true
  });
  const [isRead] = useIsReadMutation({
    refetchQueries: ["notifications", "notificationsCount"],
    awaitRefetchQueries: true
  });

  async function redirect(type: string, id: number | string, notifId: string) {
    try {
      await isRead({
        variables: { input: { id: String(notifId) } }
      });

      if (type === "Policy") history.push(`/policy/${id}`);
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
      variables: { input: notifIds }
    });
  };

  function onDeleteComplete() {
    setSelected([]);
  }

  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(notifications.map(n => String(n.id)));
    } else {
      setSelected([]);
    }
  }
  const handleChange = (props: any) => {
    setLabelTime(props.label);
  };
  const handleReset = () => {
    setLabelTime("Date Added...");
  };
  return (
    <div>
      <Helmet>
        <title>Notifications - PricewaterhouseCoopers</title>
      </Helmet>

      <Container fluid className="p-md-5 ">
        <h2>Notifications Manager</h2>
        <Row>
          <Col xs={12} lg={12}>
            <Form onSubmit={notificationForm.handleSubmit(onSubmit)}>
              <Row>
                <Col xs={12} md={4} className="mb-1">
                  <Input
                    placeholder="Search Notifications..."
                    name="notif"
                    innerRef={notificationForm.register}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-1">
                  <Select
                    options={time}
                    name="date"
                    onChange={handleChange}
                    placeholder={"Date Added..."}
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
                      <FaUndo />
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
                  <FaTrash />
                </DialogButton>
              </Tooltip>
            </div>
          </Col>
        </Row>

        <div className="table-responsive mt-1">
          <Table
            loading={networkStatus === NetworkStatus.loading}
            reloading={networkStatus === NetworkStatus.setVariables}
          >
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selected.length === notifications.length ? true : false
                    }
                    onChange={toggleCheckAll}
                  />
                </th>
                <th>Name</th>
                <th>Subject</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(data => {
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
                      <input
                        type="checkbox"
                        checked={selected.includes(String(data.id))}
                        onClick={e => e.stopPropagation()}
                        onChange={() => toggleCheck(String(data.id))}
                      />
                    </td>
                    <td className={data.isRead ? "" : "text-orange text-bold"}>
                      {data.senderUserName}
                    </td>
                    <td className={data.isRead ? "" : "text-orange text-bold"}>
                      {data.title}
                    </td>
                    <td className={data.isRead ? "" : "text-orang text-bold"}>
                      {formatDate(data.createdAt)}
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
      </Container>
    </div>
  );
};

export default Notification;
