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

const dummy = [
  {
    id: 0,
    createdAt: new Date(),
    isRead: false,
    title: "",
    originatorType: "",
    originatorId: 0,
    selected: false,
    senderUser: {
      name: "",
      firstName: "",
      lastName: ""
    }
  }
];
const Notification = ({ history }: RouteComponentProps) => {
  const { data, loading } = useNotificationsQuery({
    fetchPolicy: "network-only"
  });
  const [search, setSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [notifs, setNotifs] = useState(dummy);
  const [destroyNotifs] = useDestroyBulkNotificationMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["notifications"],
    awaitRefetchQueries: true
  });
  const [isRead] = useIsReadMutation({
    refetchQueries: ["notifications"],
    awaitRefetchQueries: true
  });
  const setItemChecked = (id: string, e: ChangeEvent) => {
    setNotifs(n =>
      n.map(item =>
        String(item.id) === id ? { ...item, selected: !item.selected } : item
      )
    );
    checkSelection();
    e.stopPropagation();
  };

  const prepareNotifs = () => {
    const prepared: any[] = [];
    if (data) {
      const n = data.notifications;
      const notifs = n ? n.collection : [];
      if (notifs) {
        notifs.map(n => {
          const temp = {
            ...n,
            selected: false
          };
          prepared.push(temp);
        });
        setNotifs(prepared);
      }
    }
  };

  useEffect(() => {
    prepareNotifs();
  }, [data]);

  useEffect(() => {
    checkSelection();
  }, [notifs]);

  const checkSelection = () => {
    const tmp = notifs.filter(n => n.selected);
    console.log("all", selectAll);
    console.log("checked", tmp);
    if (tmp.length == notifs.length) {
      setSelectAll(!selectAll);
    }
    console.log("aftercheck", selectAll);
  };

  const setSelectAllCheck = () => {
    if (selectAll) {
      setNotifs(n => n.map(item => ({ ...item, selected: false })));
      setSelectAll(!selectAll);
    } else {
      setNotifs(n => n.map(item => ({ ...item, selected: true })));
    }
  };

  const redirect = (type: String, id: number) => {
    const input: IsReadInput = { id: String(id) };
    console.log("i", input);
    isRead({
      variables: { input }
    });
    if (type == "Policy") history.push(`/policy/${id}`);
    else if (type == "BusinessProcess") history.push(`/business-process/${id}`);
    else if (type == "Control") history.push(`/control/${id}`);
    else if (type == "Risk") history.push(`/risk/${id}`);
    else if (type == "User") history.push(`/settings/update-profile`);
  };

  const handleDelete = () => {
    const toBeDeleted = notifs.filter(n => n.selected);
    const temp: string[] = [];
    toBeDeleted.map(data => {
      const notifsId = String(data.id);
      temp.push(notifsId);
    });
    const notifIds: DestroyBulkNotificationInput = { ids: temp };
    destroyNotifs({
      variables: { input: notifIds }
    });
  };

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
            <Tooltip description="Delete Selected History">
              <div className="clickable d-flex justify-content-center align-items-center deleteButton">
                <FaTrash className="text-orange " size={22} />
              </div>
            </Tooltip>
          </DialogButton>
        </div>
        <div className="table-responsive mt-5">
          {loading ? (
            <LoadingSpinner centered size={30} />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={e => setSelectAllCheck()}
                    />
                  </th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {notifs.map(data => (
                  <tr
                    key={data.id}
                    onClick={() =>
                      redirect(data.originatorType, data.originatorId)
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={data.selected}
                        onChange={e => setItemChecked(String(data.id), e)}
                      />
                    </td>
                    <td className={data.isRead ? "" : "text-orange text-bold"}>
                      {data.senderUser.name}
                    </td>
                    <td className={data.isRead ? "" : "text-orange text-bold"}>
                      {data.title}
                    </td>
                    <td className={data.isRead ? "" : "text-orang text-bold"}>
                      {formatDate(data.createdAt, {
                        year: "numeric",
                        month: "2-digit",
                        day: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Notification;
