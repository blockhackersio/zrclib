import React, { ReactNode } from "react";
import { FieldValues, Path, useForm } from "react-hook-form";
import { Alert, Label, Select, TextInput } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import { Button } from "@/ui/Button";
import { Horizontal } from "@/ui/Horizontal";
import classNames from "classnames";
type FieldDescriptor<T extends string | number | symbol> =
  | {
      label?: string;
      name: T;
      type: "textfield";
      required?: boolean | string;
      right?: string;
      pattern?: { value: RegExp; message: string };
      validate?: (v: string) => boolean;
    }
  | {
      label?: string;
      name: T;
      type: "numericfield";
      required?: boolean | string;
      right?: string;
      validate?: (v: string) => boolean;
    }
  | {
      label?: string;
      name: T;
      type: "textarea";
      required?: boolean | string;
      pattern?: { value: RegExp; message: string };
      validate?: (v: string) => boolean;
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
      flex1?: "left" | "right" | "none";
    }
  | {
      label: string;
      type: "submit";
    }
  | {
      label?: string;
      name: T;
      type: "password";
      submit?: boolean;
      submitText?: string;
      required?: boolean | string;
      pattern?: { value: RegExp; message: string };
      validate?: (v: string) => boolean;
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
          <div className="flex flex-row">
            <TextInput
              type="text"
              {...controller.register(field.name, {
                required: field.required,
                pattern: field.pattern,
                validate: field.validate,
              })}
            />
            {field.right && <div className="pt-2">{field.right}</div>}
          </div>
          {controller.formState.errors[field.name] && (
            <Alert color="failure" icon={HiInformationCircle} role="alert">{`${
              controller.formState.errors[field.name]?.message
            }`}</Alert>
          )}
        </FieldWrapper>
      );
    case "password":
      return (
        <FieldWrapper key={index}>
          {field.label && <Label htmlFor={field.name} value={field.label} />}
          <Horizontal gap>
            <TextInput
              type="password"
              className={classNames(
                controller.formState.errors[field.name] &&
                  "border-l-4 pl-2 border-red-300"
              )}
              {...controller.register(field.name, {
                required: field.required,
                pattern: field.pattern,
                validate: field.validate,
              })}
            />
            {field.submit && <Button type="submit">{field.submitText}</Button>}
          </Horizontal>
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
          <div className="flex flex-row gap-4">
            <TextInput
              className="flex-1"
              type="number"
              {...controller.register(field.name, {
                required: field.required,
                validate: field.validate,
              })}
            />
            {field.right && <div className="pt-2">{field.right}</div>}
          </div>
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
              validate: field.validate,
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
    case "submit":
      return (
        <FieldWrapper>
          <Button type="submit">{field.label}</Button>
        </FieldWrapper>
      );
    default:
      return null;
  }
}

export function FormProcessor<T extends FieldValues>({
  controller,
  formData,
  onSubmit = () => {},
}: {
  onSubmit?: (data: T) => void;
  formData: FormDataInput<T>;
  controller: ReturnType<typeof useForm<T>>;
}) {
  return (
    <form onSubmit={controller.handleSubmit(onSubmit)}>
      <div className="flex flex-col ">
        {formData.fields.map((field, index) =>
          renderField(controller, field, index)
        )}
      </div>
    </form>
  );
}

FormProcessor.displayName = "FormProcessor";
