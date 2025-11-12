"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useLingui } from "@lingui/react/macro";
import { Type } from "@sinclair/typebox";
import { Value, ValueError } from "@sinclair/typebox/value";
import { TableType } from "db";
import useSWRMutation from "swr/mutation";
import Checkbox from "@/components/ui/Checkbox";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { fetcher } from "@/lib/fetcher";
import { logger } from "@/lib/logger";

type CreateTableModalProps = {
  roomId: string
  onCreateTableSuccess: (tableId: string) => void
  onCancel: () => void
}

type CreateTablePayloadFetcher = CreateTablePayload & { roomId: string }

export default function CreateTableModal({ roomId, onCreateTableSuccess, onCancel }: CreateTableModalProps): ReactNode {
  const { t } = useLingui();
  const [errorMessages, setErrorMessages] = useState<CreateTableFormValidationErrors>({});

  const {
    error: createTableError,
    trigger: createTable,
    isMutating: isCreateTableMutating,
  } = useSWRMutation(
    "/api/games/towers/tables",
    (url: string, { arg }: { arg: CreateTablePayloadFetcher }) =>
      fetcher<string>(url, { method: "POST", body: JSON.stringify(arg) }),
    {
      onSuccess(response: ApiResponse<string>) {
        if (response.success) {
          const tableId: string | undefined = response.data;
          if (tableId) {
            onCreateTableSuccess(tableId);
            onCancel?.();
          }
        }
      },
    },
  );

  const handleFormValidation = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    const formElement: EventTarget & HTMLFormElement = event.currentTarget;
    const formData: FormData = new FormData(formElement);
    const payload: CreateTablePayload = {
      tableType: formData.get("tableType") as TableType,
      isRated: formData.get("isRated") === "on",
    };
    const errors: ValueError[] = Array.from(Value.Errors(createTableSchema, payload));

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "tableType":
          setErrorMessages((prev: CreateTableFormValidationErrors) => ({
            ...prev,
            tableType: t({ message: "You must select a table type." }),
          }));
          break;
        case "isRated":
          setErrorMessages((prev: CreateTableFormValidationErrors) => ({
            ...prev,
            isRated: t({ message: "You must rate this game." }),
          }));
          break;
        default:
          logger.warn(`Create Table Validation: Unknown error at ${error.path}`);
          break;
      }
    }

    if (Object.keys(errorMessages).length === 0) {
      await createTable({ ...payload, roomId });
    }
  };

  if (createTableError) return <div>Error: {createTableError.message}</div>;

  return (
    <Modal
      title={t({ message: "Create Table" })}
      confirmText={t({ message: "Create" })}
      isConfirmButtonDisabled={isCreateTableMutating}
      dataTestId="create-table"
      onConfirm={handleFormValidation}
      onCancel={onCancel}
    >
      <Select
        id="tableType"
        label={t({ message: "Table Type" })}
        defaultValue={TableType.PUBLIC}
        required
        errorMessage={errorMessages.tableType}
      >
        <Select.Option value={TableType.PUBLIC}>Public</Select.Option>
        <Select.Option value={TableType.PROTECTED}>Protected</Select.Option>
        <Select.Option value={TableType.PRIVATE}>Private</Select.Option>
      </Select>

      <Checkbox
        id="isRated"
        label={t({ message: "Rated Game" })}
        defaultChecked={true}
        errorMessage={errorMessages.isRated}
      />
    </Modal>
  );
}

export const createTableSchema = Type.Object({
  tableType: Type.Union([
    Type.Literal(TableType.PUBLIC),
    Type.Literal(TableType.PROTECTED),
    Type.Literal(TableType.PRIVATE),
  ]),
  isRated: Type.Boolean(),
});

export type CreateTablePayload = FormPayload<typeof createTableSchema>
export type CreateTableFormValidationErrors = FormValidationErrors<keyof CreateTablePayload>
