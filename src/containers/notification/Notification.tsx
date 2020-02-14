import { NetworkStatus } from "apollo-boost";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { Container, Input } from "reactstrap";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  DestroyBulkNotificationInput,
  IsReadInput,
  useDestroyBulkNotificationMutation,
  useIsReadMutation,
  useNotificationsQuery
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import { date as formatDate } from "../../shared/formatter";

const Notification = ({ history }: RouteComponentProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 800);

  const { data, networkStatus } = useNotificationsQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: {
        title_or_originator_type_cont: debounceSearch
      }
    }
  });
  const notifications = oc(data)
    .notifications.collection([])
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const [destroyNotifs, destroyNotifsM] = useDestroyBulkNotificationMutation({
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
    isRead({
      variables: { input: readId }
    });

    if (type === "Policy") history.push(`/policy/${id}`);
    else if (type === "BusinessProcess")
      history.push(`/business-process/${id}`);
    else if (type === "Control") history.push(`/control/${id}`);
    else if (type === "Risk") history.push(`/risk/${id}`);
    else if (type === "User") history.push(`/user`);
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
      <Helmet>
        <title>Notifications - PricewaterhouseCoopers</title>
      </Helmet>

      <Container fluid className="p-5">
        <h2>Notifications Manager</h2>

        <div className="d-flex justify-content-between">
          <Input
            value={search}
            placeholder="Search Notifications..."
            onChange={e => setSearch(e.target.value)}
            className="w-50"
          />
          <Tooltip description="Delete Selected Notification(s)">
            <DialogButton
              className="soft red"
              loading={destroyNotifsM.loading}
              onConfirm={() => handleDelete()}
            >
              <FaTrash />
            </DialogButton>
          </Tooltip>
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
