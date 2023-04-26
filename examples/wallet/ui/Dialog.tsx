import { Modal } from "flowbite-react";
import { ReactNode } from "react";
import { LayoutContext, LayoutProps } from "./LayoutProvider";

export function Dialog(p: { content?: ReactNode; onClose: () => void }) {
  return (
    <Modal show={!!p.content} onClose={p.onClose}>
      <LayoutContext.Provider value={ModalLayout}>
        {p.content}
      </LayoutContext.Provider>
    </Modal>
  );
}
export function ModalLayout(p: LayoutProps) {
  return (
    <>
      {p.header && <Modal.Header>{p.header}</Modal.Header>}
      <Modal.Body>{p.body ?? p.children}</Modal.Body>
      {p.footer && <Modal.Footer>{p.footer}</Modal.Footer>}
    </>
  );
}
