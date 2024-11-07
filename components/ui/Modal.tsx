"use client"

import { FormEvent, PropsWithChildren, ReactNode, useEffect, useRef } from "react"
import Button from "@/components/ui/Button"

type ModalProps = PropsWithChildren<{
  title: string
  isOpen: boolean
  confirmText?: string
  cancelText?: string
  isConfirmButtonDisabled?: boolean
  dataTestId?: string
  onConfirm?: (event: FormEvent<HTMLFormElement>) => void
  onCancel?: () => void
}>

export default function Modal({
  children,
  title,
  isOpen,
  cancelText = "Cancel",
  confirmText = "Confirm",
  isConfirmButtonDisabled = false,
  dataTestId = undefined,
  onCancel,
  onConfirm
}: ModalProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
      dialogRef.current?.focus()
    } else {
      dialogRef.current?.close()
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault()
        handleCancel()
      }
    }

    dialogRef.current?.addEventListener("keydown", handleKeyDown)
    return () => dialogRef.current?.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const handleConfirm = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onConfirm?.(event)
  }

  const handleCancel = (): void => {
    onCancel?.()
    dialogRef.current?.close()
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 z-40 w-full max-w-md rounded shadow-lg -translate-x-1/2 -translate-y-1/2"
      data-testid={dataTestId}
      onCancel={handleCancel}
    >
      <form noValidate onSubmit={(event: FormEvent<HTMLFormElement>) => handleConfirm(event)}>
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
          <h3 className="text-2xl">{title}</h3>
          <button
            className="self-start p-2 text-gray-400 hover:text-gray-500"
            aria-label="Close modal"
            onClick={handleCancel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-300">
          {onConfirm && (
            <Button type="submit" className="w-full" disabled={isConfirmButtonDisabled}>
              {confirmText}
            </Button>
          )}
          <Button type="button" className="w-full !ring-0" onClick={handleCancel}>
            {cancelText}
          </Button>
        </div>
      </form>
    </dialog>
  )
}

// "use client"

// import { FormEvent, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react"
// import { DraggableData, DraggableEvent } from "react-draggable"
// import { Position, Rnd } from "react-rnd"
// import Button from "@/components/ui/Button"
// import { useAppDispatch, useAppSelector } from "@/lib/hooks"
// import { IModal, maximizeModal, minimizeModal } from "@/redux/features/modal-slice"
// import { RootState } from "@/redux/store"

// export type ModalHandle = {
//   openModal: () => void
//   closeModal: () => void
// }

// type ModalProps = PropsWithChildren<{
//   modalId: string
//   title?: string
//   customWidth?: number | string
//   customHeight?: number | string
//   customPosition?: Position
//   isDraggable?: boolean
//   isMinimizable?: boolean
//   confirmText?: string
//   cancelText?: string
//   isConfirmButtonDisabled?: boolean
//   dataTestId?: string
//   onConfirm?: (event: FormEvent<HTMLFormElement>) => void
//   onCancel?: () => void
// }>

// export default function Modal({
//   children,
//   modalId,
//   title,
//   customWidth = 448, // 1350
//   customHeight = "auto", // 768
//   customPosition = { x: 0, y: 0 },
//   isDraggable = true,
//   isMinimizable = false,
//   cancelText = "Cancel",
//   confirmText = "Confirm",
//   isConfirmButtonDisabled = false,
//   dataTestId = undefined,
//   onConfirm,
//   onCancel
// }: ModalProps): ReactNode {
//   const dispatch = useAppDispatch()
//   const modalState = useAppSelector((state: RootState) =>
//     state.modal.modals.find((modal: IModal) => modal.id === modalId)
//   )
//   const backdropRef = useRef<HTMLDivElement>(null)
//   const dialogRef = useRef<Rnd>(null)
//   const [width, setWidth] = useState<number | string>(customWidth)
//   const [height, setHeight] = useState<number | string>(customHeight)
//   const [position, setPosition] = useState<Position>(customPosition)

//   useEffect(() => {
//     if (modalState?.isOpen && !modalState?.isMinimized) {
//       const handleKeyDown = (event: KeyboardEvent): void => {
//         if (event.key === "Escape") {
//           event.preventDefault()
//           handleCancel()
//         }
//       }

//       document.addEventListener("keydown", handleKeyDown)

//       if (dialogRef.current) {
//         setWidth(customWidth)
//         setHeight(customHeight)
//         setPosition(customPosition)
//       }

//       return () => {
//         document.removeEventListener("keydown", handleKeyDown)
//       }
//     }
//   }, [modalState])

//   useEffect(() => {
//     if (modalState?.isOpen && !modalState?.isMinimized && backdropRef.current && dialogRef.current) {
//       const parent: HTMLDivElement = backdropRef.current
//       const parentWidth: number = parent.clientWidth
//       const parentHeight: number = parent.clientHeight

//       const widthValue: number = typeof width === "number" ? width : parseFloat(width)
//       const dialogHeight: string | number | undefined = height === "auto"
//         ? dialogRef.current?.resizableElement.current?.offsetHeight
//         : height
//       const heightValue: number = typeof dialogHeight === "number" ? dialogHeight : 0

//       if (!isNaN(widthValue) && Number.isFinite(widthValue) && dialogHeight !== undefined) {
//         const initialX: number = (parentWidth - widthValue) / 2
//         const initialY: number = (parentHeight - heightValue) / 2
//         setPosition({ x: initialX, y: initialY })
//       }
//     }
//   }, [modalState, width, height])

//   const handleConfirm = (event: FormEvent<HTMLFormElement>): void => {
//     event.preventDefault()
//     onConfirm?.(event)
//   }

//   const handleDragStop = (e: DraggableEvent, data: DraggableData): void => {
//     setPosition({ x: data.x, y: data.y })
//   }

//   const handleToggleMinimize = (): void => {
//     if (modalState?.isMinimized) {
//       dispatch(maximizeModal(modalId))
//     } else {
//       dispatch(minimizeModal(modalId))
//     }
//   }

//   const handleCancel = (): void => {
//     onCancel?.()
//   }

//   if (!modalState?.isOpen || modalState?.isMinimized) return null

//   return (
//     <div ref={backdropRef} className="absolute inset-0 z-40 bg-black bg-opacity-25">
//       <Rnd
//         ref={dialogRef}
//         className="bg-white"
//         size={{ width, height }}
//         position={position}
//         bounds=".protected-layout-content"
//         disableDragging={!isDraggable}
//         enableResizing={false}
//         cancel=".dialog-top-action-buttons, .dialog-content, .dialog-footer"
//         role="dialog"
//         aria-labelledby={title}
//         aria-modal="true"
//         data-testid={dataTestId}
//         onDragStop={handleDragStop}
//       >
//         <form className="flex flex-col h-full" noValidate onSubmit={(event: FormEvent<HTMLFormElement>) => handleConfirm(event)}>
//           <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
//             <h3 className="text-2xl">{title}</h3>
//             <div className="dialog-top-action-buttons flex items-center">
//               {isMinimizable &&
//                 <button
//                   type="button"
//                   className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
//                   aria-label={modalState?.isMinimized ? "Maximize modal" : "Minimize modal"}
//                   onClick={handleToggleMinimize}
//                 >
//                   {modalState?.isMinimized
//                     ? <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-6 h-6"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <rect x="6" y="6" width="12" height="12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                     : <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-6 h-6"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" />
//                     </svg>
//                   }
//                 </button>
//               }
//               <button
//                 className="p-2 text-gray-400 hover:text-gray-500 cursor-pointer"
//                 aria-label="Close modal"
//                 onClick={handleCancel}
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="w-6 h-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//           <div className="dialog-content flex-1 p-4 cursor-default">{children}</div>
//           <div className="dialog-footer flex justify-end gap-2 p-4 border-t border-gray-300 cursor-default">
//             {onConfirm && (
//               <Button type="submit" className="w-full" disabled={isConfirmButtonDisabled}>
//                 {confirmText}
//               </Button>
//             )}
//             <Button type="button" className="w-full !ring-0" onClick={handleCancel}>
//               {cancelText}
//             </Button>
//           </div>
//         </form>
//       </Rnd>
//     </div>
//   )
// }
