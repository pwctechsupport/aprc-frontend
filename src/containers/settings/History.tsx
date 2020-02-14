import groupBy from "lodash/groupBy";
import React, { Fragment } from "react";
import useForm from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Form, FormGroup, Input, Label } from "reactstrap";
import styled from "styled-components";
import {
  DestroyVersionInput,
  HistoryListQuery,
  useDestroyHistoryMutation,
  useHistoryListQuery
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import Tooltip from "../../shared/components/Tooltip";
import { date as formatDate } from "../../shared/formatter";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Helmet from "react-helmet";

const History = () => {
  const { data, loading } = useHistoryListQuery({
    fetchPolicy: "network-only"
  });
  const sectionedData = prepareHistory(data);
  const defaultValues = {};
  const [destroy] = useDestroyHistoryMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["historyList"],
    awaitRefetchQueries: true
  });

  const { register, handleSubmit } = useForm<DestroyVersionInput>({
    defaultValues
  });

  const handleDelete = (values: any) => {
    const ids = Object.keys(values)
      .filter(key => values[key])
      .map(Number);

    const historyIds: DestroyVersionInput = { ids };
    destroy({
      variables: { input: historyIds }
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
      <Form onSubmit={handleSubmit(handleDelete)}>
        <div className="d-flex flex-row justify-content-between">
          <h4>History</h4>
        </div>
        <div className="d-flex justify-content-end">
          <Tooltip description="Delete Selected History">
            <DialogButton
              onConfirm={handleSubmit(handleDelete)}
              className="soft red"
            >
              <FaTrash className="text-orange " />
            </DialogButton>
          </Tooltip>
        </div>
        <div>
          {sectionedData &&
            Object.keys(sectionedData).map(key => {
              return (
                <Fragment key={key}>
                  <HistoryTitle className="mt-3 text-grey">{key}</HistoryTitle>
                  {sectionedData[key].map(history => {
                    return (
                      <Fragment key={history.key + " " + history.id}>
                        <FormGroup check className="py-3">
                          <Input
                            type="checkbox"
                            name={history.id + ""}
                            id={"historyCheckbox" + history.id}
                            innerRef={register}
                          />
                          <Label
                            for={"historyCheckbox" + history.id}
                            check
                            className="pl-2"
                          >
                            {history.description}
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
      .map(h => {
        const key = formatDate(h.createdAt, {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long"
        });
        return { ...h, key };
      })
      .sort((a, b) => new Date(b.key).getTime() - new Date(a.key).getTime());
    // histories = [ {key: '12-12-12', id: 'b', desc: 'c' }, ...]

    const groupedHistories = groupBy(histories, item => item.key);
    // groupedHistories = { '12-12-12': [ History ], .... }

    return groupedHistories;
  }
};
