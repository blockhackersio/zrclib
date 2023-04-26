import React, { ReactNode } from "react";
import { FieldValues, Path, UseFormRegister, useForm } from "react-hook-form";
import { Alert, Label, Select, TextInput } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
type FieldDescriptor<T extends string | number | symbol> =
  | {
      label?: string;
      name: T;
      type: "textfield";
      required?: boolean | string;
      pattern?: { value: RegExp; message: string };
    }
  | {
      label?: string;
      name: T;
      type: "numericfield";
      required?: boolean | string;
    }
  | {
      label?: string;
      name: T;
      type: "textarea";
      required?: boolean | string;
      pattern?: { value: RegExp; message: string };
    }
  | {
      label?: string;
      name: T;
      type: "dropdown";
      options: Array<{ value: string; label: string }>;
      required?: boolean | string;
    }
  | {
      label: string;
      type: "combination";
      fields: FieldDescriptor<T>[];
    };

export type FormDataInput<T> = {
  title: string;
  fields: Array<FieldDescriptor<Path<T>>>;
};
function FieldWrapper(p: { children: ReactNode }) {
  return <div className="w-full flex flex-col gap-4 mb-3">{p.children}</div>;
}
function renderField<T extends FieldValues>(
  controller: ReturnType<typeof useForm<T>>,
  field: FieldDescriptor<Path<T>>,
  index: number
) {
  switch (field.type) {
    case "textfield":
      return (
        <FieldWrapper key={index}>
          {field.label && <Label htmlFor={field.name} value={field.label} />}
          <TextInput
            type="text"
            {...controller.register(field.name, {
              required: field.required,
              pattern: field.pattern,
            })}
          />
          {controller.formState.errors[field.name] && (
            <Alert color="failure" icon={HiInformationCircle} role="alert">{`${
              controller.formState.errors[field.name]?.message
            }`}</Alert>
          )}
        </FieldWrapper>
      );
    case "numericfield":
      return (
        <FieldWrapper key={index}>
          {field.label && <Label htmlFor={field.name} value={field.label} />}
          <TextInput
            type="number"
            {...controller.register(field.name, {
              required: field.required,
            })}
          />
          {controller.formState.errors[field.name]?.message && (
            <Alert color="failure" icon={HiInformationCircle} role="alert">{`${
              controller.formState.errors[field.name]?.message
            }`}</Alert>
          )}
        </FieldWrapper>
      );
    case "textarea":
      return (
        <FieldWrapper>
          <textarea
            {...controller.register(field.name, {
              required: field.required,
              pattern: field.pattern,
            })}
            key={index}
          />
          {controller.formState.errors[field.name] && (
            <Alert color="failure" icon={HiInformationCircle} role="alert">{`${
              controller.formState.errors[field.name]?.message
            }`}</Alert>
          )}
        </FieldWrapper>
      );
    case "dropdown":
      return (
        <FieldWrapper key={index}>
          {field.label && <Label htmlFor={field.name} value={field.label} />}
          <Select
            {...controller.register(field.name, { required: field.required })}
            key={index}
          >
            {field.options.map((option, oIndex) => (
              <option value={option.value} key={oIndex}>
                {option.label}
              </option>
            ))}
          </Select>
          {controller.formState.errors[field.name] && (
            <Alert color="failure" icon={HiInformationCircle} role="alert">{`${
              controller.formState.errors[field.name]?.message
            }`}</Alert>
          )}
        </FieldWrapper>
      );
    case "combination":
      return (
        <FieldWrapper key={index}>
          {field.label && <Label value={field.label} />}
          <div className="flex flex-row gap-4 w-full justify-between">
            {field.fields.map((field, i) => renderField(controller, field, i))}
          </div>
        </FieldWrapper>
      );
    default:
      return null;
  }
}

export function FormProcessor<T extends FieldValues>({
  formData,
  controller,
}: {
  formData: FormDataInput<T>;
  controller: ReturnType<typeof useForm<T>>;
}) {
  return (
    <form
      onSubmit={(evt) => {
        evt.stopPropagation();
        evt.preventDefault();
      }}
    >
      <div className="flex flex-col ">
        {formData.fields.map((field, index) =>
          renderField(controller, field, index)
        )}
      </div>
    </form>
  );
}

FormProcessor.displayName = "FormProcessor";
