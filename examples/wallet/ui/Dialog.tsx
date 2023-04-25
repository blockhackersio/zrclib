import { Modal } from "flowbite-react";
import { ReactNode, FC } from "react";

export type LayoutProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export type DialogContentProps = {
  Layout?: FC<LayoutProps>;
};

export type DialogContent = FC<DialogContentProps>;

function isComponent(value: any): value is FC {
  return typeof value === "function";
}

function getElement(value: FC | ReactNode | undefined): ReactNode {
  if (!value) return null;

  if (isComponent(value)) {
    const Value = value;
    return <Value />;
  }

  return value;
}

export function ModalLayout(p: LayoutProps) {
  return (
    <>
      {p.header && <Modal.Header>{p.header}</Modal.Header>}
      <Modal.Body>{getElement(p.children)}</Modal.Body>
      {p.footer && <Modal.Footer>{p.footer}</Modal.Footer>}
    </>
  );
}

export function Dialog(p: { content?: ReactNode; onClose: () => void }) {
  return (
    <Modal show={!!p.content} onClose={p.onClose}>
      {p.content}
    </Modal>
  );
}
