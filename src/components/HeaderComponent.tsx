import SearchBar from "@/components/layouts/header/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { QueryKeys, Role, Status } from "@/utils/app.constant";
import {
  getCenterList,
  getStateBlockDistrictList,
} from "../services/MasterDataService";
import AreaSelection from "./AreaSelection";
import { transformArray } from "../utils/Helper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useQueryClient } from "@tanstack/react-query";
import { formatedBlocks, formatedDistricts } from "@/services/formatedCohorts";
import { useRouter } from "next/router";
import useSubmittedButtonStore from "@/utils/useSharedState";

interface State {
  value: string;
  label: string;
  tenantId?: string;
}

interface District {
  value: string;
  label: string;
}

interface Block {
  value: string;
  label: string;
}
interface CenterProp {
  cohortId: string;
  name: string;
}
const Sort = ["A-Z", "Z-A"];

const HeaderComponent = ({
  children,
  userType,
  searchPlaceHolder,
  selectedSort,
  handleSortChange,
  handleFilterChange,
  showSort = false,
  showAddNew = true,
  showStateDropdown = false,
  showFilter = true,
  statusArchived,
  statusInactive,
  handleSearch,
  handleAddUserClick,
  selectedCenter,
  handleCenterChange,
  statusValue,
  shouldFetchDistricts = true,
  setStatusValue,
  setSelectedDistrictCode,
  setSelectedDistrict,
  setSelectedBlockCode,
  setSelectedBlock,
  setSelectedCenter,
  setSelectedCenterCode,
  setSelectedStateCode,
  showTenantCohortDropDown = true,
  tenants,
  cohorts,
  selectedTenant,
  selectedCohort,
  handleTenantChange,
  handleCohortChange,
  cohortDefaultValue,
  tenantDefaultValue,
  isTenantShow,
  isCohortShow,
  showSearch = true,
}: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const theme = useTheme<any>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stateDefaultValue, setStateDefaultValue] = useState<string>("");
  const [allCenters, setAllCenters] = useState<CenterProp[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const selectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.selectedBlockStore
  );
  const setSelectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedBlockStore
  );
  const selectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.selectedDistrictStore
  );
  const setSelectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedDistrictStore
  );
  const selectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.selectedCenterStore
  );
  const setSelectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedCenterStore
  );

  useEffect(() => {
    const fetchData = async () => {
      const { state, district, center } = router.query;
      const fullPath = router.asPath;

      // Extract query parameters
      const queryString = fullPath.split("?")[1]; // Get the part after '?'
      const params = new URLSearchParams(queryString);

      // Check if 'block' is present
      const hasBlock = params.has("block");
      const hasDistrict = params.has("district");
      const hasCenter = params.has("center");
      const hasState = params.has("state");
      try {
        const object = {
          // "limit": 20,
          // "offset": 0,
          fieldName: "states",
        };
        // const response = await getStateBlockDistrictList(object);
        // const result = response?.result?.values;
        if (typeof window !== "undefined" && window.localStorage) {
          const admin = localStorage.getItem("adminInfo");
          if (admin) {
            const stateField = JSON.parse(admin).customFields.find(
              (field: any) => field.label === "STATES"
            );
            if (stateField?.value?.includes(",")) {
              setStateDefaultValue(t("COMMON.ALL_STATES"));
            } else {
              setStateDefaultValue(stateField?.value);

              const response = await queryClient.fetchQuery({
                queryKey: [
                  QueryKeys.FIELD_OPTION_READ,
                  stateField?.code,
                  "districts",
                ],
                queryFn: () =>
                  getStateBlockDistrictList({
                    controllingfieldfk: stateField?.code,
                    fieldName: "districts",
                  }),
              });

              // const object = {
              //   controllingfieldfk: stateField?.code,

              //   fieldName: "districts",
              // };
              // const response = await getStateBlockDistrictList(object);
              const result = response?.result?.values;
              const districtResult = await formatedDistricts();
              let blockResult;
              setDistricts(districtResult);
              if (!hasDistrict) {
                // setSelectedDistrict([districtResult[0]?.label]);
                // setSelectedDistrictCode(districtResult[0]?.value);
                // localStorage.setItem(
                //   "selectedDistrict",
                //   districtResult[0]?.label
                // );
                // setSelectedDistrictStore(districtResult[0]?.label);
                blockResult = await formatedBlocks(districtResult[0]?.value);
                if (
                  blockResult?.message === "Request failed with status code 404"
                ) {
                  setBlocks([]);
                } else {
                  setBlocks(blockResult);
                }
              }

              if (!hasBlock && !hasDistrict) {
                if (userType === Role.TEAM_LEADERS || userType === "Centers") {
                  //  setSelectedBlock([t("COMMON.ALL_BLOCKS")]);
                  //setSelectedBlockCode("")
                  router.replace({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      state: stateField?.code,
                      district: districtResult[0]?.value,
                    },
                  });
                } else {
                  if (
                    blockResult?.message ===
                    "Request failed with status code 404"
                  ) {
                    setBlocks([]);
                  } else {
                    setSelectedBlock([blockResult[0]?.label]);
                    setSelectedBlockCode(blockResult[0]?.value);
                    localStorage.setItem(
                      "selectedBlock",
                      blockResult[0]?.label
                    );
                    setSelectedBlockStore(blockResult[0]?.label);
                  }

                  router.replace({
                    pathname: router.pathname,
                    // query: {
                    //   ...router.query,
                    //   state: stateField?.code,
                    //   district: districtResult[0]?.value,
                    //   block: blockResult[0]?.value,
                    // },
                  });
                }
              }

              const getCentersObject = {
                limit: 0,
                offset: 0,
                filters: {
                  // "type":"COHORT",
                  status: ["active"],
                  // states: stateField?.code,
                  // districts: districtResult[0]?.value,
                  // blocks: blockResult[0]?.value,
                  // "name": selected[0]
                },
              };
              const centerResponse = await queryClient.fetchQuery({
                queryKey: [
                  QueryKeys.FIELD_OPTION_READ,
                  getCentersObject.limit,
                  getCentersObject.offset,
                  getCentersObject.filters,
                ],
                queryFn: () => getCenterList(getCentersObject),
              });
              // const response = await getCenterList(getCentersObject);
              // setSelectedBlockCohortId(
              //   response?.result?.results?.cohortDetails[0].cohortId
              // );
              //   const result = response?.result?.cohortDetails;
              const dataArray = centerResponse?.result?.results?.cohortDetails;

              const cohortInfo = dataArray
                ?.filter((cohort: any) => cohort.type !== "BLOCK")
                .map((item: any) => ({
                  cohortId: item?.cohortId,
                  name: item?.name,
                }));
              setAllCenters(cohortInfo);

              if (
                !hasCenter &&
                !hasBlock &&
                !hasDistrict &&
                userType !== Role.TEAM_LEADERS
              ) {
                setSelectedCenter([t("COMMON.ALL_CENTERS")]);
                //  setSelectedCenterCode([cohortInfo[0]?.cohortId])
                //   localStorage.setItem('selectedCenter',cohortInfo[0]?.name )
                //  setSelectedCenterStore(cohortInfo[0]?.name)
                router.replace({
                  pathname: router.pathname,
                  // query: {
                  //   ...router.query,
                  //   state: stateField?.code,
                  //   district: districtResult[0]?.value,
                  //   block: blockResult[0]?.value,
                  //   // center: cohortInfo[0]?.cohortId
                  // },
                });
              }
            }

            const object = [
              {
                value: stateField?.code,
                label: stateField?.value,
              },
            ];
            setStates(object);
          }
        }
        //  setStates(result);
      } catch (error) {
        // console.log(error);
      }
    };

    if (shouldFetchDistricts) {
      fetchData();
    }
  }, [shouldFetchDistricts, userType]);
  const handleChange = (event: React.SyntheticEvent, newValue: any) => {
    setStatusValue(newValue);
  };

  useEffect(() => {
    const handleRouteparam = async () => {
      const { state, district, block, center } = router.query;
      if (state) {
        setSelectedStateCode(state.toString());
      }
      if (district) {
        setSelectedDistrictCode(district.toString());
        // setSelectedDistrict([selectedDistrictStore])
        setSelectedDistrict([localStorage.getItem("selectedDistrict")]);
        if (!localStorage.getItem("selectedDistrict")) {
          setSelectedDistrict([selectedDistrictStore]);
        }
        try {
          const blockResult = await formatedBlocks(district?.toString());
          if (blockResult.message === "Request failed with status code 404") {
            setBlocks([]);
          } else setBlocks(blockResult);
        } catch {
          //  console.log("hii")
        }
      }

      if (block) {
        setSelectedBlockCode(block.toString());
        // setSelectedBlock([selectedBlockStore])
        setSelectedBlock([localStorage.getItem("selectedBlock")]);
        if (!localStorage.getItem("selectedBlock"))
          setSelectedBlock([selectedBlockStore]);
      }

      if (center) {
        setSelectedCenterCode([center.toString()]);
        // setSelectedCenter([selectedCenterStore])
        setSelectedCenter([localStorage.getItem("selectedCenter")]);
        if (!localStorage.getItem("selectedCenter"))
          setSelectedCenter([selectedCenterStore]);
      }

      //  setInitialized(true)
    };
    handleRouteparam();
  }, [router, userType]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "8px" : "16px",
        padding: isMobile ? "8px" : "16px",
        backgroundColor: theme.palette.secondary["100"],
        borderRadius: "8px",
      }}
    >
      {/* {!showStateDropdown && (
        <Typography variant="h1" sx={{ mt: isMobile ? "12px" : "20px" }}>
          {userType}
        </Typography>
      )} */}

      {showTenantCohortDropDown && (
        <AreaSelection
          tenants={transformArray(tenants)}
          cohorts={transformArray(cohorts)}
          selectedTenant={selectedTenant}
          selectedCohort={selectedCohort}
          handleTenantChange={handleTenantChange}
          handleCohortChange={handleCohortChange}
          isMobile={isMobile}
          tenantDefaultValue={tenantDefaultValue}
          cohortDefaultValue={cohortDefaultValue}
          userType={userType}
          isMediumScreen={isMediumScreen}
          inModal={false}
          isTenantShow={isTenantShow}
          isCohortShow={isCohortShow}
        />
      )}

      <Box
        sx={{
          backgroundColor: "white",
          paddingTop: "20px",
        }}
      >
        {showFilter && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={statusValue}
              onChange={handleFilterChange}
              aria-label="Tabs where selection follows focus"
              selectionFollowsFocus
            >
              <Tab
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color:
                        statusValue === Status.ACTIVE
                          ? theme.palette.primary["100"]
                          : "inherit",
                    }}
                  >
                    {t("COMMON.ACTIVE")}
                  </Box>
                }
                value={Status.ACTIVE}
              />
              {/* Uncomment this section if you need the INACTIVE tab
      <Tab
        label={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color:
                statusValue === Status.INACTIVE
                  ? theme.palette.primary["100"]
                  : "inherit",
            }}
          >
            {t("COMMON.INACTIVE")}
          </Box>
        }
        value={Status.INACTIVE}
      />
      */}
              {statusInactive && (
                <Tab
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color:
                          statusValue === Status.INACTIVE
                            ? theme.palette.primary["100"]
                            : "inherit",
                      }}
                    >
                      {t("COMMON.INACTIVE")}
                    </Box>
                  }
                  value={Status.INACTIVE}
                />
              )}
              {statusArchived && (
                <Tab
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color:
                          statusValue === Status.ARCHIVED
                            ? theme.palette.primary["100"]
                            : "inherit",
                      }}
                    >
                      {t("COMMON.ARCHIVED")}
                    </Box>
                  }
                  value={Status.ARCHIVED}
                />
              )}
            </Tabs>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile || isMediumScreen ? "column" : "row",
            gap: isMobile || isMediumScreen ? "8px" : "5%",
            marginTop: showSearch ? "20px" : "10px",
            p: showSearch ? "1%" : "1%",
          }}
        >
          {showSearch && (
            <Box sx={{ flex: 1, paddingLeft: "16px", paddingRight: "16px" }}>
              <SearchBar
                onSearch={handleSearch}
                placeholder={searchPlaceHolder}
              />
            </Box>
          )}
          {showAddNew && (
            <Box
              display={"flex"}
              gap={1}
              alignItems={"center"}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // height: "40px",
                width: isMobile ? "70%" : "200px",
                borderRadius: "20px",
                border: "1px solid #1E1B16",
                //  mt: isMobile ? "10px" : "16px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                mr: "10px",
                ml: isMobile ? "50px" : isMediumScreen ? "10px" : undefined,
                mt: isMobile ? "10px" : isMediumScreen ? "10px" : undefined,
              }}
            >
              <Button
                //  variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "none",
                  fontSize: "14px",
                  color: theme.palette.primary["100"],
                }}
                onClick={handleAddUserClick}
              >
                {t("COMMON.ADD_NEW")}
              </Button>
            </Box>
          )}
        </Box>
        {showSort && (
          <Box
            sx={{
              display: "flex",

              ml: "10px",
              mt: isMobile ? "10px" : "16px",
              mb: "10px",
              gap: "15px", // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {showSort && (
              <FormControl sx={{ minWidth: "120px" }}>
                <Select
                  value={selectedSort}
                  onChange={handleSortChange}
                  displayEmpty
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    marginLeft: "5px",
                    fontSize: "14px",
                    position: "relative",
                    backgroundColor: theme.palette.secondary["100"],
                  }}
                >
                  <MenuItem value="Sort">{t("COMMON.SORT")}</MenuItem>
                  {Sort?.map((state, index) => (
                    <MenuItem value={state} key={index}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}
        {children}
      </Box>
    </Box>
  );
};

export default HeaderComponent;
