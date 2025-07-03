"use client"

import {
  ComponentType,
  Context,
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

type ModalPropsBase = {
  onCancel: () => void
}

type ModalComponent<P extends ModalPropsBase> = ComponentType<P>

type ModalInstance<P extends ModalPropsBase = ModalPropsBase> = {
  Component: ModalComponent<P>
  props: P
}

interface ModalContextType {
  openModal: <P extends ModalPropsBase>(
    component: ModalComponent<P>,
    props: Omit<P, "onCancel"> & Partial<Pick<P, "onCancel">>,
  ) => void
  closeModal: () => void
  closeAllModals: () => void
}

const ModalContext: Context<ModalContextType | undefined> = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: PropsWithChildren): ReactNode => {
  const [modals, setModals] = useState<ModalInstance[]>([])

  const openModal = useCallback(
    <P extends ModalPropsBase>(
      Component: ModalComponent<P>,
      props: Omit<P, "onCancel"> & Partial<Pick<P, "onCancel">>,
    ) => {
      setModals((prev): ModalInstance[] => [
        ...prev,
        {
          Component: Component as ModalComponent<ModalPropsBase>,
          props: {
            ...props,
            onCancel: (): void => {
              props.onCancel?.()
              closeModal()
            },
          },
        },
      ])
    },
    [],
  )

  const closeModal = useCallback(() => {
    setModals((prev: ModalInstance<ModalPropsBase>[]) => prev.slice(0, -1)) // Pop the topmost modal
  }, [])

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals }}>
      {children}
      {modals?.map(({ Component, props }, index) => <Component key={index} {...props} onCancel={props.onCancel} />)}
    </ModalContext.Provider>
  )
}

export const useModal = (): ModalContextType => {
  const context: ModalContextType | undefined = useContext(ModalContext)
  if (!context) throw new Error("useModal must be used within a ModalProvider")
  return context
}
