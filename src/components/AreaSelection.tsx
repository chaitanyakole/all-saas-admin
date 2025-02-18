import { Box, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import MultipleSelectCheckmarks from "./FormControl";
import { capitalizeFirstLetterOfEachWordInArray } from "@/utils/Helper";
import { useMediaQuery } from "@mui/material";
import { Role } from "@/utils/app.constant";

// interface State {
//   value: string;
//   label: string;
// }

// interface District {
//   value: string;
//   label: string;
// }

// interface Block {
//   value: string;
//   label: string;
// }
// interface Centers {
//   cohortId: string;
//   name: string;
// }
interface Tenant {
  value: string;
  label: string;
}

interface Cohort {
  value: string;
  label: string;
}
interface DropdownBoxProps {
  inModal?: boolean;
  isMobile: boolean;
  isMediumScreen: boolean;
  isCenterSelection?: boolean;
  stateDefaultValue?: string;
  userType?: string;
  reAssignModal?: boolean;
  blockDefaultValue?: string;
  districtDefaultValue?: string;
  tenants: Tenant[];
  cohorts: Cohort[];
  selectedTenant: string[];
  selectedCohort: string[];
  handleTenantChange: (selected: string[]) => void;
  handleCohortChange: (selected: string[]) => void;
  tenantDefaultValue?: string;
  cohortDefaultValue?: string;
  isTenantShow?: boolean;
  isCohortShow?: boolean;
}

const AreaSelection: React.FC<DropdownBoxProps> = ({
  isMobile,
  isMediumScreen,
  isCenterSelection = false,
  inModal = false,
  tenants,
  cohorts,
  selectedTenant,
  selectedCohort,
  handleTenantChange,
  handleCohortChange,
  tenantDefaultValue,
  cohortDefaultValue,
  userType,
  reAssignModal = false,
  isTenantShow = false,
  isCohortShow = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  let isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down("sm")
  );
  // isSmallScreen=isMobile?true: false;
  // const blockDisable = districtDefaultValue ? false : true;
  const shouldRenderSelectCheckmarks = !(
    reAssignModal && userType === Role.TEAM_LEADERS
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: "end",
        flexDirection: "row",
        gap: "20%",
        "@media (max-width: 900px)": {
          flexDirection: "column",
          gap: 2,
        },
      }}
    >
      <Box
        sx={{
          width: inModal ? "100%" : "90%",
          "@media (max-width: 900px)": {
            width: "100%",
          },
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "end",
          }}
        >
          {isTenantShow && (
            <Grid
              item
              xs={12}
              sm={inModal ? 12 : 6}
              md={inModal ? 12 : 6}
              lg={inModal ? 12 : isCenterSelection ? 6 : 6}
            >
              <MultipleSelectCheckmarks
                names={
                  Array.isArray(tenants)
                    ? tenants.map(
                        (tenant: any) =>
                          tenant.label?.toLowerCase().charAt(0).toUpperCase() +
                          tenant.label?.toLowerCase().slice(1)
                      )
                    : []
                }
                codes={
                  Array.isArray(tenants)
                    ? tenants.map((tenant: Tenant) => tenant.value)
                    : []
                }
                tagName={t("TENANT.TENANT_MEMBER")}
                selectedCategories={selectedTenant}
                onCategoryChange={handleTenantChange}
                overall={!inModal}
                defaultValue={tenantDefaultValue}
              />
            </Grid>
          )}

          {isCohortShow && (
            <Grid
              item
              xs={12}
              sm={inModal ? 12 : 6}
              md={inModal ? 12 : 6}
              lg={inModal ? 12 : isCenterSelection ? 6 : 6}
            >
              <MultipleSelectCheckmarks
                names={
                  Array.isArray(cohorts)
                    ? cohorts.map((cohort: any) => cohort.label)
                    : []
                }
                codes={
                  Array.isArray(cohorts)
                    ? cohorts.map((cohort: any) => cohort.cohortId)
                    : []
                }
                tagName={t("COHORTS.COHORT_MEMBER")}
                selectedCategories={selectedCohort}
                onCategoryChange={handleCohortChange}
                // disabled={
                //   !Array.isArray(cohorts) ||
                //   cohorts.length <= 0 ||
                //   (selectedTenant?.length === 0 &&
                //     tenantDefaultValue === t("COHORTS.ALL_STATES"))
                // }
                overall={!inModal}
                defaultValue={cohortDefaultValue}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default AreaSelection;
