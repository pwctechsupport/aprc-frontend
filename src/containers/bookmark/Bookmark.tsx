import { NetworkStatus } from "apollo-boost";
import { get } from "lodash";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import Select from "react-select";
import { Button, Col, Container, Form, Input, Row } from "reactstrap";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useBookmarksQuery,
  useDestroyBookmarkMutation
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import { date, removeEmpty } from "../../shared/formatter";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";

const Bookmark = ({ history }: RouteComponentProps) => {
  const formAnjing = useForm();
  const [search, setSearch] = useState("");

  const [checked, setChecked] = useState<string[]>([]);
  const [debounceSearch] = useDebounce(search, 800);

  const time = [
    { label: "All Time", value: 1 },
    { label: "In 7 days", value: 2 },
    { label: "In a month", value: 1 },
    { label: "In 90 days", value: 1 },
    { label: "In a year", value: 1 }
  ];
  const aDay = 86400000;
  const aWeek = 604800000;
  const aMonth = 2592000000;
  const threeMonths = 7776000000;
  const aYear = 31536000000;

  function constructDateFilter(input: any) {
    if (!input || input === "All Time") return null;
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
  const [filter, setFilter] = useState({});
  const { data, networkStatus, loading } = useBookmarksQuery({
    variables: {
      filter: {
        title_cont: "Lorem"
      }
    },
    fetchPolicy: "network-only"
  });
  console.log("data", data);
  const [deleteBookmarks, deleteBookmarksM] = useDestroyBookmarkMutation({
    refetchQueries: ["bookmarks"],
    onError: notifyGraphQLErrors,
    onCompleted: onDeleteComplete
  });

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }

  function toggleCheck(id: string) {
    if (checked.includes(id)) {
      setChecked(checked.filter(i => i !== id));
    } else {
      setChecked(checked.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setChecked(
        oc(data)
          .bookmarks.collection([])
          .map(b => b.id)
      );
    } else {
      setChecked([]);
    }
  }

  function handleDelete() {
    deleteBookmarks({ variables: { ids: checked } });
  }

  function onDeleteComplete() {
    notifySuccess();
    setChecked([]);
  }

  function handleClickRow({
    id,
    type
  }: {
    id?: string | null;
    type: OriginatorType;
  }) {
    let link: string = "/";

    if (type) {
      if (type === "Policy") {
        link = `/policy/${id}`;
      } else if (type === "BusinessProcess") {
        link = `/business-process/${id}`;
      } else if (type === "Control") {
        link = `/control/${id}`;
      } else if (type === "Risk") {
        link = `/risk-and-control/${id}`;
      } else if (type === "User") {
        link = `/user/${id}`;
      }

      history.push(link);
    }
  }
  const onSubmit = (values: any) => {
    console.log("values", values);
    setFilter({ title_cont: "Lorem" });
  };
  return (
    <div>
      <Helmet>
        <title>Bookmarks - PricewaterhouseCoopers</title>
      </Helmet>

      <Container fluid className="p-5">
        <h2>Bookmarks Manager</h2>

        <Row>
          <Col lg={4}>
            <Form onSubmit={formAnjing.handleSubmit(onSubmit)}>
              <Input
                placeholder="Search Title..."
                name="title"
                innerRef={formAnjing.register}
              />
              <Select options={[{ label: 1 }, { label: 2 }]} name="date" />
              <Button
                loading={loading}
                type="submit"
                className="pwc ml-2"
                color="primary"
              >
                Search
              </Button>
            </Form>
          </Col>
          <Col lg={8}>
            <div className="text-right">
              <DialogButton
                className="soft red"
                disabled={!checked.length}
                loading={deleteBookmarksM.loading}
                onConfirm={handleDelete}
              >
                <FaTrash />
              </DialogButton>
            </div>
          </Col>
        </Row>

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
                      checked.length &&
                      checked.length ===
                        oc(data).bookmarks.collection([]).length
                        ? true
                        : false
                    }
                    onChange={toggleCheckAll}
                  />
                </th>
                <th>Bookmarks Category</th>
                <th>Title</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {oc(data)
                .bookmarks.collection([])
                .map(bookmark => {
                  return (
                    <tr
                      key={bookmark.id}
                      onClick={() =>
                        handleClickRow({
                          id: bookmark.originatorId,
                          type: bookmark.originatorType as OriginatorType
                        })
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={checked.includes(bookmark.id)}
                          onChange={e => toggleCheck(bookmark.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td>{bookmark.originatorType}</td>
                      <td>
                        {get(bookmark, "originator.name") ||
                          get(bookmark, "originator.processName") ||
                          get(bookmark, "originator.riskName") ||
                          get(bookmark, "originator.title")}
                      </td>
                      <td>{date(bookmark.createdAt)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

type OriginatorType =
  | "Policy"
  | "BusinessProcess"
  | "Control"
  | "Risk"
  | "User";

export default Bookmark;
