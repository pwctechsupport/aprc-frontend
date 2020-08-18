import { NetworkStatus } from "apollo-boost";
import { get } from "lodash";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { FaTrash, FaUndo } from "react-icons/fa";
import { RouteComponentProps } from "react-router-dom";
import Select from "react-select";
import { Col, Container, Form, Input, Row } from "reactstrap";
import { oc } from "ts-optchain";
import Button from "../../shared/components/Button";
import {
  useBookmarksQuery,
  useDestroyBookmarkMutation,
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import { date } from "../../shared/formatter";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import Tooltip from "../../shared/components/Tooltip";
import Footer from "../../shared/components/Footer";
import CheckBox from "../../shared/components/forms/CheckBox";

const Bookmark = ({ history }: RouteComponentProps) => {
  const bookmarkForm = useForm();
  const [labelTime, setLabelTime] = useState("Date added...");
  const [checked, setChecked] = useState<string[]>([]);

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
  const [filter, setFilter] = useState({});
  const { data, networkStatus, loading } = useBookmarksQuery({
    variables: {
      filter,
    },
    fetchPolicy: "network-only",
  });
  const [deleteBookmarks, deleteBookmarksM] = useDestroyBookmarkMutation({
    refetchQueries: ["bookmarks"],
    onError: notifyGraphQLErrors,
    onCompleted: onDeleteComplete,
  });

  function toggleCheck(id: string) {
    if (checked.includes(id)) {
      setChecked(checked.filter((i) => i !== id));
    } else {
      setChecked(checked.concat(id));
    }
  }
  const [clicked, setClicked] = useState(true);
  const clickButton = () => setClicked((p) => !p);
  function toggleCheckAll() {
    if (clicked) {
      setChecked(
        oc(data)
          .bookmarks.collection([])
          .map((b) => b.id)
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
    type,
  }: {
    id?: string | null;
    type: OriginatorType;
  }) {
    let link: string = "/";

    if (type) {
      if (type === "Policy") {
        link = `/policy/${id}`;
      } else if (type === "BusinessProcess") {
        link = `/risk-and-control/${id}`;
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
    setFilter({
      originator_of_Policy_type_title_or_originator_of_BusinessProcess_type_name_or_originator_of_Control_type_description_or_originator_of_Risk_type_name_or_originator_type_cont:
        values.title,
      created_at_gteq: constructDateFilter(labelTime),
    });
  };
  const handleChange = (props: any) => {
    setLabelTime(props.label);
  };
  const isDataExist = data?.bookmarks?.collection.length;
  const handleReset = () => {
    setLabelTime("Date added...");
  };
  return (
    <div>
      <Helmet>
        <title>Bookmarks - PricewaterhouseCoopers</title>
      </Helmet>
      <Container style={{ minHeight: "80vh" }} fluid className="p-md-5">
        <h2 style={{ fontSize: "23px" }}>Bookmarks manager</h2>

        <Row>
          <Col>
            <Form onSubmit={bookmarkForm.handleSubmit(onSubmit)}>
              <Row>
                <Col xs={12} md={4} className="mb-1">
                  {" "}
                  <Input
                    placeholder="Search title..."
                    name="title"
                    innerRef={bookmarkForm.register}
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
        <div className="table-responsive mt-1" style={{ minHeight: "70vh" }}>
          <Table
            loading={networkStatus === NetworkStatus.loading}
            reloading={networkStatus === NetworkStatus.setVariables}
          >
            <thead>
              <tr>
                <th>
                  <CheckBox
                    checked={
                      checked.length &&
                      checked.length ===
                        oc(data).bookmarks.collection([]).length
                        ? true
                        : false
                    }
                    onClick={() => {
                      clickButton();
                      toggleCheckAll();
                    }}
                  />
                </th>
                <th>Bookmarks category</th>
                <th>Title</th>
                <th>Date added</th>
              </tr>
            </thead>
            <tbody>
              {isDataExist ? (
                oc(data)
                  .bookmarks.collection([])
                  .map((bookmark) => {
                    return (
                      <tr
                        key={bookmark.id}
                        onClick={() =>
                          handleClickRow({
                            id: bookmark.originatorId,
                            type: bookmark.originatorType as OriginatorType,
                          })
                        }
                      >
                        <td>
                          <CheckBox
                            checked={checked.includes(bookmark.id)}
                            onClick={(e: any) => {
                              e.stopPropagation();
                              toggleCheck(bookmark.id);
                            }}
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
                  })
              ) : (
                <tr>
                  <td className="empty" colSpan={4}>
                    No item
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Container>
      <Footer />
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
