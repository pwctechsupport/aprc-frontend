import React, { Fragment, ReactNode, useState } from "react";

import { ModalDialog, ModalDialogProps } from "./Modal";
import Button, { ButtonProps } from "./Button";

export interface DialogButtonProps extends ButtonProps {
  color?: ButtonProps["color"];
  data?: any;
  children: ReactNode;
  title?: ModalDialogProps["title"];
  message?: ModalDialogProps["message"];
  onConfirm?: (data: DialogButtonProps["data"]) => void;
  onReject?: (data: DialogButtonProps["data"]) => void;
  actions?: ModalDialogProps["actions"];
  loading?: boolean;
}

const DialogButton = ({
  color = "default",
  title = "Confirmation",
  message = "Are you sure?",
  data,
  children,
  onConfirm,
  onReject,
  actions,
  loading,
  isCreate,
  isEdit,
  ...btnProps
}: DialogButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>();

  function _onClick(event: any) {
    event.stopPropagation();
    setIsOpen(true);
  }

  function _toggle() {
    setIsOpen(!isOpen);
  }

  function _onConfirm() {
    onConfirm && onConfirm(data);
    setIsOpen(false);
  }

  function _onNo() {
    onReject && onReject(data);
    _toggle();
  }

  return (
    <Fragment>
      <Button {...btnProps} loading={loading} color={color} onClick={_onClick}>
        {children}
      </Button>
      <ModalDialog
        isCreate={isCreate}
        isEdit={isEdit}
        isOpen={isOpen}
        title={title}
        message={message}
        toggle={_toggle}
        functions={{ onNo: _onNo, onYes: _onConfirm }}
        disabled={loading}
        actions={actions}
      />
    </Fragment>
  );
};

export default DialogButton;
