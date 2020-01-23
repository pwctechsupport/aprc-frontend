import React from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { DocumentNode, OperationVariables } from "apollo-boost";

export default function useLazyQueryReturnPromise<
  TData = any,
  TVariables = OperationVariables
>(query: DocumentNode) {
  const client = useApolloClient();
  return React.useCallback(
    (variables: TVariables) =>
      client.query<TData, TVariables>({
        query: query,
        variables: variables
      }),
    [client, query]
  );
}
