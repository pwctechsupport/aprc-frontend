import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { Input } from "reactstrap";
import DialogButton from "../../shared/components/DialogButton";
import Tooltip from "../../shared/components/Tooltip";
import { FaTrash } from "react-icons/fa";
import Table from "../../shared/components/Table";
import { date as formatDate } from "../../shared/formatter";

const dummy = [
  {
    id: 1,
    name: "Ann Flores",
    message: "Prepare Tender Proposal",
    createdAt: new Date(),
    selected: false
  },
  {
    id: 2,
    name: "Ian Reynard",
    message: "Request to Edit Policy",
    createdAt: new Date(),
    selected: false
  }
];
const Notification = () => {
  const [search, setSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [notifs, setNotifs] = useState(dummy);
  const setItemChecked = (id: string) => {
    setNotifs(n =>
      n.map(item =>
        String(item.id) === id ? { ...item, selected: !item.selected } : item
      )
    );
    checkSelection();
  };

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
          <DialogButton onConfirm={() => {}}>
            <Tooltip description="Delete Selected History">
              <div className="clickable d-flex justify-content-center align-items-center deleteButton">
                <FaTrash className="text-orange " size={22} />
              </div>
            </Tooltip>
          </DialogButton>
        </div>
        <div className="table-responsive mt-5">
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
                <tr key={data.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={data.selected}
                      onChange={e => setItemChecked(String(data.id))}
                    />
                  </td>
                  <td>{data.name}</td>
                  <td>{data.message}</td>
                  <td>
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
        </div>
      </Container>
    </div>
  );
};

export default Notification;
