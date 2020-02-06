import React, { Fragment } from "react";
import {
  useHistoryListQuery,
  HistoryListQuery,
  DestroyVersionInput,
  useDestroyHistoryMutation
} from "../../generated/graphql";
import { date as formatDate } from "../../shared/formatter";
import styled from "styled-components";
import groupBy from "lodash/groupBy";
import { Form, FormGroup, Input, Label } from "reactstrap";
import useForm from "react-hook-form";
import DialogButton from "../../shared/components/DialogButton";
import Tooltip from "../../shared/components/Tooltip";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

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

  const { register, handleSubmit, errors } = useForm<DestroyVersionInput>({
    defaultValues
  });

  const handleDelete = (values: any) => {
    const filtered = Object.keys(values).filter(key => values[key]);
    console.log(filtered);
    filtered.map(id => {
      const historyId: DestroyVersionInput = { id };
      destroy({
        variables: { input: historyId }
      });
    });
  };

  return (
    <div>
      <Form onSubmit={handleSubmit(handleDelete)}>
        <div className="d-flex flex-row justify-content-between">
          <h4>History</h4>
          <DialogButton onConfirm={handleSubmit(handleDelete)}>
            <Tooltip description="Delete Selected History">
              <DeleteButton className="clickable d-flex justify-content-center align-items-center">
                <FaTrash className="text-orange " size={22} />
              </DeleteButton>
            </Tooltip>
          </DialogButton>
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
                        <Devider />
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

const HistoryTitle = styled.div`
  font-weight: bold;
  margin-top: 35px;
  font-size: 16px;
`;

const Devider = styled.div`
  height: 1px;
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
`;

const DeleteButton = styled.div`
  border-radius: 10px;
  background: #ffeded;
  width: 50px;
  height: 50px;
`;

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

export default History;
