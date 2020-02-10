import React, { useState, useEffect, ChangeEvent } from "react";
import { Container, Row, Col } from "reactstrap";
import { Input } from "reactstrap";
import DialogButton from "../../shared/components/DialogButton";
import Tooltip from "../../shared/components/Tooltip";
import { FaTrash } from "react-icons/fa";
import Table from "../../shared/components/Table";
import { date as formatDate } from "../../shared/formatter";
import {
  useNotificationsQuery,
  useDestroyBulkNotificationMutation,
  DestroyBulkNotificationInput,
  useIsReadMutation,
  IsReadInput
} from "../../generated/graphql";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { NetworkStatus } from "apollo-boost";
import { useDebounce } from "use-debounce/lib";

const Notification = ({ history }: RouteComponentProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 800);

  const { data, networkStatus } = useNotificationsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: {
        title_or_originator_type_cont: debounceSearch
        // originator_of_Policy_type_title_or_originator_of_BusinessProcess_type_name_or_originator_of_Control_type_description_or_originator_of_Risk_type_name_or_originator_of_User_type_name_cont: debounceSearch
      }
    }
  });
  const notifications = oc(data)
    .notifications.collection([])
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const [destroyNotifs] = useDestroyBulkNotificationMutation({
    onCompleted: () => {
      toast.success("Delete Success");
      onDeleteComplete();
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["notifications"],
    awaitRefetchQueries: true
  });
  const [isRead] = useIsReadMutation({
    refetchQueries: ["notifications"],
    awaitRefetchQueries: true
  });

  const redirect = (type: String, id: number, notifId: String) => {
    const readId: IsReadInput = { id: String(notifId) };
    console.log("i", readId);
    isRead({
      variables: { input: readId }
    });

    if (type == "Policy") history.push(`/policy/${id}`);
    else if (type == "BusinessProcess") history.push(`/business-process/${id}`);
    else if (type == "Control") history.push(`/control/${id}`);
    else if (type == "Risk") history.push(`/risk/${id}`);
    else if (type == "User") history.push(`/settings/update-profile`);
  };

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

  return (
    <div>
      <Container fluid className="p-5">
        <h2 className="mb-3">Notification Manager</h2>
        <div className="d-flex flex-row justify-content-between">
          <div className="side-box__searchbar">
            <Input
              value={search}
              placeholder="Search Notification..."
              onChange={e => setSearch(e.target.value)}
              className="orange"
            />
          </div>
          <DialogButton onConfirm={() => handleDelete()}>
            <Tooltip description="Delete Selected Notification(s)">
              <div className="clickable d-flex justify-content-center align-items-center deleteButton">
                <FaTrash className="text-orange " size={22} />
              </div>
            </Tooltip>
          </DialogButton>
        </div>
        <div className="table-responsive mt-5">
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
              {notifications.map(data =>
                data ? (
                  <tr
                    key={String(data.id)}
                    onClick={() =>
                      data.originatorType
                        ? redirect(
                            data.originatorType,
                            Number(data.originatorId),
                            String(data.id)
                          )
                        : null
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(String(data.id))}
                        onClick={e => e.stopPropagation()}
                        onChange={e => toggleCheck(String(data.id))}
                      />
                    </td>
                    <td className={data.isRead ? "" : "text-orange text-bold"}>
                      {data.senderUser ? data.senderUser.name : ""}
                    </td>
                    <td className={data.isRead ? "" : "text-orange text-bold"}>
                      {"Request to edit " +
                        data.originatorType +
                        " : " +
                        data.title}
                    </td>
                    <td className={data.isRead ? "" : "text-orang text-bold"}>
                      {formatDate(data.createdAt, {
                        year: "numeric",
                        month: "2-digit",
                        day: "numeric"
                      })}
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

export default Notification;
