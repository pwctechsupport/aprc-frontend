import groupBy from "lodash/groupBy";
import React, { Fragment, useState } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Col, Form, FormGroup, Label, Row } from "reactstrap";
import styled from "styled-components";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  DestroyVersionInput,
  HistoryListQuery,
  useDestroyHistoryMutation,
  useHistoryListQuery,
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import Footer from "../../shared/components/Footer";
import CheckBox from "../../shared/components/forms/CheckBox";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Tooltip from "../../shared/components/Tooltip";
import { date as formatDate } from "../../shared/formatter";

const History = () => {
  const { data, loading } = useHistoryListQuery({
    fetchPolicy: "network-only",
  });
  const [selected, setSelected] = useState<string[]>([]);
  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }
  const sectionedData = prepareHistory(data);
  const histories = data?.versions?.collection || [];
  const selectAllHistories = histories.map((a) => a.id || "");

  const [clicked, setClicked] = useState(true);
  const clickButton = () => setClicked((p) => !p);
  function toggleCheckAll() {
    if (clicked) {
      setSelected(selectAllHistories);
    } else {
      setSelected([]);
    }
  }

  const defaultValues = {};
  const [destroy] = useDestroyHistoryMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["historyList"],
    awaitRefetchQueries: true,
  });

  const { handleSubmit } = useForm<DestroyVersionInput>({
    defaultValues,
  });

  const handleDelete = () => {
    destroy({
      variables: { input: { ids: selected.map(Number) } },
    });
  };

  if (loading) {
    return <LoadingSpinner size={30} centered />;
  }

  return (
    <div>
      <Helmet>
        <title>History - Settings - PricewaterhouseCoopers</title>
      </Helmet>
      <div style={{ minHeight: "80vh" }}>
        <Form onSubmit={handleSubmit(handleDelete)}>
          <div className="d-flex flex-row justify-content-between">
            <h4>User activity log</h4>
          </div>
          <div className="d-flex justify-content-end">
            <Tooltip description="Delete Selected History">
              <DialogButton
                onConfirm={handleSubmit(handleDelete)}
                className="soft red"
              >
                <PickIcon name="trash" className="clickable" />
              </DialogButton>
            </Tooltip>
          </div>
          <Row>
            <Col lg={2}>
              <CheckBox
                checked={selected.length === histories.length}
                onClick={() => {
                  clickButton();
                  toggleCheckAll();
                }}
              />
              <Label className="ml-2">Select all</Label>
            </Col>
          </Row>
          <div>
            {sectionedData &&
              Object.keys(sectionedData).map((key) => {
                return (
                  <Fragment key={key}>
                    <HistoryTitle className="mt-3 text-grey">
                      {key}
                    </HistoryTitle>
                    {sectionedData[key].map((history) => {
                      return (
                        <Fragment key={history.key + " " + history.id}>
                          <FormGroup check className="py-3">
                            <CheckBox
                              checked={selected.includes(history.id || "")}
                              onClick={(e: any) => {
                                e.stopPropagation();
                                toggleCheck(history.id || "");
                              }}
                            />
                            <Label
                              for={"historyCheckbox" + history.id}
                              check
                              className="pl-2"
                            >
                              {history.description?.replace(
                                "destroy",
                                "remove"
                              )}
                            </Label>
                          </FormGroup>
                          <div className="divider" />
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
          </div>
        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default History;

//------------------------------------------------------------
// Building Blocks
//------------------------------------------------------------

const HistoryTitle = styled.div`
  font-weight: bold;
  margin-top: 35px;
  font-size: 16px;
`;

//------------------------------------------------------------
// Formatter Functions
//------------------------------------------------------------

const prepareHistory = (history: HistoryListQuery | undefined) => {
  const historyData = history && history.versions;
  if (historyData) {
    const histories = historyData.collection
      .map((h) => {
        const key = formatDate(h.createdAt, {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        });
        return { ...h, key };
      })
      .sort((a, b) => new Date(b.key).getTime() - new Date(a.key).getTime());
    // histories = [ {key: '12-12-12', id: 'b', desc: 'c' }, ...]

    const groupedHistories = groupBy(histories, (item) => item.key);
    // groupedHistories = { '12-12-12': [ History ], .... }

    return groupedHistories;
  }
};
