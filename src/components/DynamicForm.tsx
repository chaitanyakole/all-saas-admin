import useSubmittedButtonStore from "@/utils/useSharedState";
import { IChangeEvent, withTheme } from "@rjsf/core";
import { Theme as MaterialUITheme } from "@rjsf/mui";
import { RJSFSchema, RegistryFieldsType, WidgetProps } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useTranslation } from "next-i18next";
import React, { ReactNode, useEffect, useState } from "react";
import CustomRadioWidget from "./form/CustomRadioWidget";
import MultiSelectCheckboxes from "./form/MultiSelectCheckboxes";
import MultiSelectDropdown from "./form/MultiSelectDropdown";
const FormWithMaterialUI = withTheme(MaterialUITheme);
import { getCurrentYearPattern } from "@/utils/Helper";

interface UiSchema {
  [key: string]: {
    "ui:widget"?: string;
    "ui:placeholder"?: string;
    "ui:help"?: string;
    "ui:options"?: object;
    [key: string]: any;
  };
}

interface DynamicFormProps {
  schema: any;
  uiSchema: object;
  formData?: object;
  onSubmit: (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => void | Promise<void>;
  onChange: (event: IChangeEvent<any>) => void;
  onError: (errors: any) => void;
  showErrorList: boolean;
  id?: string;

  widgets?: {
    [key: string]: React.FC<WidgetProps<any, RJSFSchema, any>>;
  };
  customFields: {
    [key: string]: React.FC<RegistryFieldsType<any, RJSFSchema, any>>;
  };
  children?: ReactNode;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  id,
  schema,
  uiSchema,
  formData,
  onSubmit,
  onChange,
  onError,
  customFields,
  children,
}) => {
  const { t } = useTranslation();
  const [localFormData, setLocalFormData] = useState(formData ?? {});
  const submittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.submittedButtonStatus
  );
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );
  const setUserEnteredEmail = useSubmittedButtonStore(
    (state: any) => state.setUserEnteredEmail
  );
  const setNoError = useSubmittedButtonStore((state: any) => state.setNoError);

  const widgets: any = {
    MultiSelectDropdown: MultiSelectDropdown,
    MultiSelectCheckboxes: MultiSelectCheckboxes,
    CustomRadioWidget: CustomRadioWidget,
  };

  const handleError = (errors: any) => {
    if (errors.length === 0) {
      // You can perform any additional action here when there are no errors
    }

    if (errors.length > 0) {
      const property = errors[0].property?.replace(/^root\./, "");
      const errorField = document.querySelector(
        `[name$="${property}"]`
      ) as HTMLElement;

      if (errorField) {
        errorField.focus();
      } else {
        const fallbackField = document.getElementById(property) as HTMLElement;
        if (fallbackField) {
          fallbackField.focus();
        }
      }
    }
    onError(errors);
  };

  const handleSubmit = (
    event: IChangeEvent<any, RJSFSchema, any>,
    formEvent: React.FormEvent<any>
  ) => {
    onSubmit(event, formEvent);
  };

  const handleChange = (event: IChangeEvent<any>) => {
    const cleanAndReplace = (data: any) => {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          data[key] = Array.from(
            new Set(
              data[key].filter((item: any) => item !== "")
              //.map((item: any) => (item === "_lifeskills" ? "life_skills" : item))
            )
          );
        }
      }
      return data;
    };

    const cleanedFormData = cleanAndReplace(event.formData);

    setLocalFormData(cleanedFormData);
    setUserEnteredEmail(cleanedFormData?.email);
    onChange({ ...event, formData: cleanedFormData });
  };

  const transformErrors = (errors: any) => {
    const currentYearPattern = new RegExp(getCurrentYearPattern());

    errors.length === 0 ? setNoError(true) : setNoError(false);

    let updatedUiSchema: UiSchema = { ...uiSchema };

    return errors
      ?.map((error: any) => {
        const property = error.property ? error.property : "";

        if (!property) {
          return error;
        }

        const isFieldRequired = schema.required?.includes(property);

        if (!isFieldRequired) {
          error.message = "";
          return null;
        }

        if (updatedUiSchema[property] && updatedUiSchema[property]["ui:help"]) {
          delete updatedUiSchema[property]["ui:help"];
        }

        if (property === "mail") {
          if (error.name === "required") {
            error.message = submittedButtonStatus
              ? t("FORM_ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD")
              : "";
          } else if (error.name === "format" || error.name === "pattern") {
            error.message = !submittedButtonStatus
              ? t("FORM_ERROR_MESSAGES.ENTER_VALID_EMAIL_ADDRESS")
              : "";
          }
          return error;
        }

        switch (error.name) {
          case "required": {
            error.message = submittedButtonStatus
              ? t("FORM_ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD")
              : "";
            break;
          }
          case "maximum": {
            if (
              schema.properties?.[property]?.validation?.includes("numeric")
            ) {
              if (property === "age") {
                error.message = t(
                  "FORM_ERROR_MESSAGES.MAX_LENGTH_DIGITS_ERROR_AGE",
                  {
                    maxLength: schema.properties?.[property]?.maxLength,
                  }
                );
              }
            }
            break;
          }
          case "minimum": {
            if (
              schema.properties?.[property]?.validation?.includes("numeric")
            ) {
              error.message = t("FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR", {
                minLength: schema.properties?.[property]?.minLength,
              });
              if (property === "age") {
                error.message = t(
                  "FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR_AGE",
                  {
                    minLength: schema.properties?.[property]?.minLength,
                  }
                );
              }
            }
            break;
          }
          case "pattern": {
            const pattern = error?.params?.pattern;

            const shouldSkipDefaultValidation =
              schema.properties?.[property]?.skipDefaultValidation;
            if (shouldSkipDefaultValidation) {
              error.message = "";
              break;
            }

            switch (pattern) {
              case "^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$": {
                error.message = t(
                  "FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
                );
                break;
              }
              case "^[6-9]\\d{9}$": {
                const validations = schema.properties?.[property]?.validation;
                if (
                  validations?.includes("mobile") ||
                  validations?.includes("mobileNo")
                ) {
                  error.message = t(
                    "FORM_ERROR_MESSAGES.ENTER_VALID_MOBILE_NUMBER"
                  );
                } else if (validations?.includes(".age")) {
                  error.message = t("age must be valid");
                } else {
                  error.message = t(
                    "FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
                  );
                }
                break;
              }

              case "^d{10}$": {
                error.message = t(
                  "FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
                );
                break;
              }
              default: {
                const validRange = currentYearPattern.test(pattern);
                if (!validRange) {
                  error.message = t("FORM_ERROR_MESSAGES.ENTER_VALID_DATA");
                }
                break;
              }
            }
            break;
          }
          case "minLength": {
            if (
              schema.properties?.[property]?.validation?.includes("numeric")
            ) {
              error.message = t("FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR", {
                minLength: schema.properties?.[property]?.minLength,
              });
            }
            break;
          }
          case "maxLength": {
            if (
              schema.properties?.[property]?.validation?.includes("numeric")
            ) {
              error.message = t("FORM_ERROR_MESSAGES.MAX_LENGTH_DIGITS_ERROR", {
                maxLength: schema.properties?.[property]?.maxLength,
              });
            }
            break;
          }
          case "format": {
            const format = error?.params?.format;
            switch (format) {
              case "email": {
                error.message = t("");
                break;
              }
            }
          }
        }

        if (!error.message && updatedUiSchema[property]) {
          error.message = updatedUiSchema[property]["ui:help"];
        }

        return error;
      })
      .filter(Boolean);
  };
  useEffect(() => {
    setSubmittedButtonStatus(false);
  }, []);
  return (
    <div className="shreyas shinde">
      <FormWithMaterialUI
        schema={schema}
        uiSchema={uiSchema}
        formData={localFormData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        validator={validator}
        liveValidate
        showErrorList={false}
        widgets={widgets}
        noHtml5Validate
        onError={handleError}
        transformErrors={transformErrors}
        fields={customFields}
        id={id}
      >
        <style>{`.rjsf-default-submit { display: none !important; }`}</style>
        {children}
      </FormWithMaterialUI>
    </div>
  );
};

export default DynamicForm;
