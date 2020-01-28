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
  loading?: boolean;
}

const DialogButton = ({
  color = "default",
  title = "Confirmation",
  message = "Are you sure?",
  data,
  children,
  onConfirm,
  loading,
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

  return (
    <Fragment>
      <Button {...btnProps} loading={loading} color={color} onClick={_onClick}>
        {children}
      </Button>
      <ModalDialog
        isOpen={isOpen}
        title={title}
        message={message}
        toggle={_toggle}
        functions={{ onNo: _toggle, onYes: _onConfirm }}
        disabled={loading}
      />
    </Fragment>
  );
};

export default DialogButton;
