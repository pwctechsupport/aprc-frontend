import React from "react";
import { toast, ToastContent, ToastOptions } from "react-toastify";
import { FaCheckCircle, FaInfoCircle, FaExclamation } from "react-icons/fa";
import { ApolloError } from "apollo-boost";
import { IconType } from "react-icons/lib/cjs";

const notify = (
  message: ToastContent,
  type: ToastOptions["type"] = "default",
  options?: ToastOptions,
  icon?: IconType
) => {
  const toastContent = (
    <div className="d-flex align-items-center pl-2">
      {icon ? icon({ className: "mr-3", size: 22 }) : null}
      {composeMessage(message)}
    </div>
  );

  toast(toastContent, { ...options, type });
};

export const notifySuccess = (
  message: ToastContent = "Success",
  options?: ToastOptions
) => {
  notify(message, "success", options, FaCheckCircle);
};

export const notifyError = (message: ToastContent, options?: ToastOptions) => {
  notify(message, "error", options, FaExclamation);
};

export const notifyInfo = (message: ToastContent, options?: ToastOptions) => {
  notify(message, "default", options, FaInfoCircle);
};

function composeMessage(messages: any) {
  if (messages instanceof Array) {
    return (
      <ul>
        {messages.map((message, index) => {
          return <li key={index}>{message}</li>;
        })}
      </ul>
    );
  }

  return messages;
}

export const notifyGraphQLErrors = (errors: ApolloError) => {
  const messages = errors.graphQLErrors.map(err => err.message);
  notifyError(messages.length ? messages : "Whoops, Something went wrong...", {
    autoClose: 5000
  });
};
