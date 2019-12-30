import React, { ReactNode, Fragment } from "react";
import {
  Modal as BsModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps as BsModalProps,
  ModalHeaderProps,
  Button
} from "reactstrap";
import classnames from "classnames";

export interface ModalProps extends BsModalProps {
  title?: string;
  toggle?: ModalHeaderProps["toggle"];
  footer?: ReactNode;
}

const Modal = ({ title, className, toggle, ...props }: ModalProps) => {
  return (
    <BsModal
      centered
      {...props}
      className={classnames("modal-enlogy", className)}
    >
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{props.children}</ModalBody>
      {props.footer && <ModalFooter>{props.footer}</ModalFooter>}
    </BsModal>
  );
};

type onClick = ((e: React.MouseEvent<any, MouseEvent>) => void) | undefined;

export interface ModalDialogProps extends ModalProps {
  message?: ReactNode;
  actions?: { yes?: string; no?: string };
  functions?: { onYes?: onClick; onNo?: onClick };
  disabled?: boolean;
}

const ModalDialog = ({
  message,
  actions = { yes: "Continue", no: "Cancel" },
  functions = {},
  disabled,
  ...props
}: ModalDialogProps) => {
  return (
    <Modal
      {...props}
      footer={
        <Fragment>
          <Button
            className="button cancel"
            onClick={functions.onNo}
            disabled={disabled}
          >
            {actions.no}
          </Button>
          <Button
            className="button pwc"
            onClick={functions.onYes}
            disabled={disabled}
          >
            {actions.yes}
          </Button>
        </Fragment>
      }
    >
      {message}
    </Modal>
  );
};

export default Modal;
export { ModalDialog };
