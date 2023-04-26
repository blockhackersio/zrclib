import { Modal } from "flowbite-react";
import { createContext, ReactNode, FC, useContext } from "react";

export type LayoutProps = {
  header?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function ModalLayout(p: LayoutProps) {
  return (
    <>
      {p.header && <Modal.Header>{p.header}</Modal.Header>}
      <Modal.Body>{p.body ?? p.children}</Modal.Body>
      {p.footer && <Modal.Footer>{p.footer}</Modal.Footer>}
    </>
  );
}

export const DialogLayoutContext = createContext<FC<LayoutProps>>(ModalLayout);

export function useLayoutTemplate() {
  return useContext(DialogLayoutContext);
}

export function Dialog(p: { content?: ReactNode; onClose: () => void }) {
  return (
    <Modal show={!!p.content} onClose={p.onClose}>
      <DialogLayoutContext.Provider value={ModalLayout}>
        {p.content}
      </DialogLayoutContext.Provider>
    </Modal>
  );
}
