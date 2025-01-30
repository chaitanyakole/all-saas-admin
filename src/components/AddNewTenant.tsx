import DynamicForm from "@/components/DynamicForm";
import {
  GenerateSchemaAndUiSchema,
  customFields,
} from "@/components/GeneratedSchemas";
import SimpleModal from "@/components/SimpleModal";
import {
  createCohort,
  tenantCreate,
} from "@/services/CohortService/cohortService";
import { CohortTypes, FormContextType } from "@/utils/app.constant";
import { useLocationState } from "@/utils/useLocationState";
import { Box, Button, Typography } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Tenatschema from "./TenantSchema.json";
import { showToastMessage } from "./Toastify";
import useSubmittedButtonStore from "@/utils/useSharedState";

interface CustomField {
  fieldId: string;
  value: string[];
}

interface CohortDetails {
  name?: string;
  domain?: any;
  status?: string;
}

interface AddLearnerModalProps {
  open: boolean;
  onClose: () => void;
  formData?: object;
  isEditModal?: boolean;
  userId?: string;
}

const uiSchema = {
  name: {
    "ui:widget": "text",
    "ui:placeholder": "Enter your full name",
    // "ui:help": "Only letters and spaces are allowed.",
  },

  domain: {
    "ui:widget": "text",
    "ui:placeholder": "Enter the domain name for your tenant",
    "ui:help": "This will be the unique identifier for your tenant.",
  },
};

const AddNewCenters: React.FC<AddLearnerModalProps> = ({
  open,
  onClose,
  formData,
  isEditModal = false,
  userId,
}) => {
  const [schema] = useState(Tenatschema);
  const { t } = useTranslation();
  const [updateBtnDisabled, setUpdateBtnDisabled] = React.useState(true);

  const roleType = FormContextType.ADMIN_CENTER;
  const {
    selectedBlockCohortId,
    selectedStateCode,
    selectedDistrictCode,
    selectedBlockCode,
    dynamicFormForBlock,
  } = useLocationState(open, onClose, roleType);

  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );

  const handleSubmit = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    const formData = data?.formData;
    try {
      if (!formData) {
        showToastMessage("Form data is required", "error");
        return;
      }
      const cohortDetails: CohortDetails = {
        name: formData?.name.replace(/\s/g, ""),
        domain: formData?.domain ? formData?.domain : " ",
        // status: formData?.status,
      };

      const cohortData = await tenantCreate(cohortDetails);
      if (
        cohortData?.responseCode === 200 ||
        cohortData?.responseCode === 201
      ) {
        showToastMessage(t("TENANT.CREATE_SUCCESSFULLY"), "success");
        onClose();
      } else {
        showToastMessage(t("TENANT.TENANT_ADMIN_FAILED_TO_CREATE"), "error");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || t("TENANT.TENANT_ADMIN_FAILED_TO_CREATE");
      showToastMessage(errorMessage, "error");
    }
  };

  const handleChange = (data: IChangeEvent<any>) => {
    setUpdateBtnDisabled(false);
  };

  const handleError = (errors: any) => {
    console.log("Form errors:", errors);
  };

  return (
    <SimpleModal
      open={open}
      onClose={onClose}
      showFooter={false}
      modalTitle={t("COMMON.ADD_NEW_TENANT")}
    >
      <>
        {schema && (
          <DynamicForm
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleSubmit}
            widgets={{}}
            showErrorList={true}
            customFields={customFields}
            onChange={handleChange}
            onError={handleError}
            // id="new-center-form"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                marginTop: "20px",
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  height: "40px",
                }}
              >
                {t("COMMON.CANCEL")}
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={updateBtnDisabled}
                onClick={() => setSubmittedButtonStatus(true)}
                sx={{
                  fontSize: "14px",
                  fontWeight: "500",
                  height: "40px",
                  color: "white",
                }}
              >
                {t("COMMON.CREATE")}
              </Button>
            </Box>
          </DynamicForm>
        )}
      </>
    </SimpleModal>
  );
};

export default AddNewCenters;
