import { DocumentNode } from "graphql";
import React from "react";
import { oc } from "ts-optchain";
import { Suggestions, toLabelValue } from "../../formatter";
import useLazyQueryReturnPromise from "../../hooks/useLazyQueryReturnPromise";
import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";

export default function ApolloSelect({
  queryDocument,
  defaultFilter = {},
  getData,
  name,
  register,
  setValue,
  ...restProps
}: ApolloSelectProps) {
  const query = useLazyQueryReturnPromise(queryDocument);

  async function handleGetSuggestions(
    title_cont: string = ""
  ): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { ...defaultFilter, title_cont }
      });
      return oc(data)
        .policies.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }
  return (
    <AsyncSelect
      {...restProps}
      name={name}
      register={register}
      setValue={setValue}
      cacheOptions
      loadOptions={handleGetSuggestions}
      defaultOptions
    />
  );
}

interface ApolloSelectProps
  extends Omit<
    AsyncSelectProps,
    "cacheOptions" | "loadOptions" | "defaultOptions"
  > {
  queryDocument: DocumentNode;
  defaultFilter?: any;
}
