import React, { ChangeEvent, useState, useEffect } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import PageSizeSelector from "@/components/PageSelector";
import {
  cohortCreate,
  deleteCohort,
  fetchCohortMemberList,
  getCohortList,
  getTenantLists,
  rolesList,
  updateCohortUpdate,
  userCreate,
} from "@/services/CohortService/cohortService";
import {
  CohortTypes,
  Numbers,
  QueryKeys,
  Role,
  SORT,
  Status,
  Storage,
} from "@/utils/app.constant";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import Loader from "@/components/Loader";
import { getFormRead } from "@/services/CreateUserService";
import {
  GenerateSchemaAndUiSchema,
  customFields,
} from "@/components/GeneratedSchemas";
import { CustomField } from "@/utils/Interfaces";
import { showToastMessage } from "@/components/Toastify";
import AddNewCenters from "@/components/AddNewTenant";
import { getCohortTableData } from "@/data/tableColumns";
import { Theme } from "@mui/system";
import {
  firstLetterInUpperCase,
  mapFields,
  transformLabel,
} from "@/utils/Helper";
import SimpleModal from "@/components/SimpleModal";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import DynamicForm from "@/components/DynamicForm";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import cohortSchema from "./cohortSchema.json";
import AddIcon from "@mui/icons-material/Add";
import userJsonSchema from "./userSchema.json";
import cohortASchema from "./cohortAdminSchema.json";
import updateCohortSchema from "./cohortUpdateSchema.json";

type cohortFilterDetails = {
  type?: string;
  status?: any;
  states?: string;
  districts?: string;
  blocks?: string;
  name?: string;
  activeMembers?: string;
  archivedMembers?: string;
};

interface centerData {
  name?: string;
  status?: string;
  updatedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  customFieldValues?: string;
}

interface Roles {
  code: string;
  roleId: string;
}

interface RoleList {
  result: Roles[];
}
const Center: React.FC = () => {
  // use hooks
  const queryClient = useQueryClient();
  const router = useRouter();

  const { t } = useTranslation();
  const adminInformation = useSubmittedButtonStore(
    (state: any) => state.adminInformation
  );
  const state = adminInformation?.customFields?.find(
    (item: any) => item?.label === "STATES"
  );

  // handle states
  const [cohortAdminSchema] = useState(cohortASchema);
  const [selectedTenant, setSelectedTenant] = React.useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = React.useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = React.useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [selectedFilter, setSelectedFilter] = useState("Active");
  const [cohortData, setCohortData] = useState<cohortFilterDetails[]>([]);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
  const [selectedCohortId, setSelectedCohortId] = React.useState<string>("");
  const [editModelOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [confirmButtonDisable, setConfirmButtonDisable] =
    React.useState<boolean>(false);
  const [inputName, setInputName] = React.useState<string>("");
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [userId, setUserId] = useState("");
  const [adminRole, setAdminRole] = useState<boolean>();
  const [schema] = React.useState(cohortSchema);
  const [cohortUpdateSchema] = React.useState(updateCohortSchema);
  const [userSchema, setUserSchema] = React.useState(userJsonSchema);
  const [openAddNewCohort, setOpenAddNewCohort] =
    React.useState<boolean>(false);
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const [pageCount, setPageCount] = useState(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = React.useState<number[]>([]);
  const [pagination, setPagination] = useState(true);
  const [sortBy, setSortBy] = useState(["createdAt", "asc"]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedBlockCode, setSelectedBlockCode] = useState("");
  const [formdata, setFormData] = useState<any>();
  const [totalCount, setTotalCound] = useState<number>(0);
  const [editFormData, setEditFormData] = useState<any>([]);
  const [listOfTenants, setListOfTenants] = useState<any>([]);
  const [isEditForm, setIsEditForm] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>("");
  const [Addmodalopen, setAddmodalopen] = React.useState(false);
  const [updateBtnDisabled, setUpdateBtnDisabled] = React.useState(true);
  const [addFormData, setAddFormData] = useState({});
  const [addBtnDisabled, setAddBtnDisabled] = useState(true);
  const [roleList, setRolelist] = useState<RoleList | undefined>(undefined);
  const [error, setError] = useState<any>([]);
  const [isCreateCohortAdminModalOpen, setIsCreateCohortAdminModalOpen] =
    useState(false);

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
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );

  const createCenterStatus = useSubmittedButtonStore(
    (state: any) => state.createCenterStatus
  );
  const setCreateCenterStatus = useSubmittedButtonStore(
    (state: any) => state.setCreateCenterStatus
  );
  const setAdminInformation = useSubmittedButtonStore(
    (state: any) => state.setAdminInformation
  );

  const uiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter full name",
      "ui:options": {},
    },
    type: {
      "ui:widget": "text",
      // "ui:placeholder": "Select type",
      // "ui:options": {
      //   defaultValue: "cohort",
      // },
      "ui:disabled": true,
    },
    district: {
      "ui:widget": "text",
      "ui:placeholder": "Enter district",
      "ui:options": {},
    },
    status: {
      "ui:widget": "CustomRadioWidget",
      "ui:options": {
        defaultValue: "active",
      },
      // "ui:disabled": true,
    },
    block: {
      "ui:widget": "text",
      "ui:placeholder": "Enter block",
      "ui:options": {},
    },
  };

  const userUiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "Full name, numbers, letters and spaces are allowed.",
    },
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
      "ui:help": "Username must be at least 3 characters long.",
    },
    password: {
      "ui:widget": "password",
      "ui:placeholder": "Enter a secure password",
      "ui:help":
        "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character.",
    },
    role: {
      "ui:widget": "select",
      "ui:placeholder": "Select a role",
      // "ui:help": "Select a role.",
    },
    mobileNo: {
      "ui:widget": "text",
      "ui:placeholder": "Mobile number",
      "ui:help": "Enter a valid 10-digit mobile number.",
    },
    email: {
      // "ui:widget": "text",
      "ui:placeholder": "Enter your email address",
      "ui:help": "Enter a valid email address.",
      // "ui:options": {},
    },
    // dob: {
    //   "ui:widget": "date",
    //   "ui:placeholder": "Select your date of birth",
    //   // "ui:help": "Date of birth in YYYY-MM-DD format.",
    // },
  };
  const cohortAdminUiSchema = {
    name: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your full name",
      "ui:help": "Full name, numbers, letters and spaces are allowed.",
    },
    username: {
      "ui:widget": "text",
      "ui:placeholder": "Enter your username",
      "ui:help": "Username must be at least 3 characters long.",
      "ui:options": {
        autocomplete: false,
        value: "",
      },
      "ui:inputProps": {
        autocomplete: false,
        value: "",
      },
    },
    password: {
      "ui:widget": "password",
      "ui:placeholder": "Enter a secure password",
      "ui:help":
        "Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character.",
      "ui:options": {
        autocomplete: false,
      },
      "ui:inputProps": {
        autocomplete: false,
        name: "password",
      },
    },
    role: {
      "ui:widget": "select",
      "ui:placeholder": "Select a role",
      // "ui:help": "Select a role.",
    },
    mobileNo: {
      "ui:widget": "text",
      "ui:placeholder": "Mobile number",
      "ui:help": "Enter a valid 10-digit mobile number.",
    },
    email: {
      // "ui:widget": "text",
      "ui:placeholder": "Enter your email address",
      "ui:help": "Enter a valid email address.",
      // "ui:options": {},
    },
    // dob: {
    //   "ui:widget": "date",
    //   "ui:placeholder": "Select your date of birth",
    //   // "ui:help": "Date of birth in YYYY-MM-DD format.",
    // },
  };

  const [filters, setFilters] = useState<cohortFilterDetails>({
    type: CohortTypes.COHORT,
    // states: "",
    status: [statusValue],
    // districts: "",
  });
  const handleCloseAddLearnerModal = () => {
    setOpenAddNewCohort(false);
    setUpdateBtnDisabled(true);
  };
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const getAdminInformation = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const admin = localStorage.getItem("adminInfo");
      if (admin) {
        // const stateField: any = JSON.parse(admin).customFields.find(
        //   (field: any) => field.label === "STATES"
        // );
        // const object = [
        //   {
        //     value: stateField.code,
        //     label: stateField.value,
        //   },
        // ];

        // setStatesInformation(object);
        // setSelectedStateCode(object[0]?.value);

        setFilters({
          type: "cohort",
          // states: "",
          status: filters.status,
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getRole = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      setAdminRole(
        getRole?.tenantData?.[0]?.roleName == "tenant admin"
          ? true
          : false || getRole?.isSuperAdmin
      );
      setUserId(getRole?.userId);
    }

    // getAddCenterFormData();
    // getCohortMemberlistData();
    getAdminInformation();
  }, []);

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     const obj = {
  //       limit: "10",
  //       page: 1,
  //       filters: {
  //         tenantId: selectedRowData?.tenantId,
  //       },
  //     };
  //     const response = await rolesList(obj);

  //     if (response?.result) {
  //       const rolesOptions = response.result.map((role: any) => ({
  //         const: role.roleId,
  //         title: role.title,
  //       }));

  //       setUserSchema((prevSchema) => ({
  //         ...prevSchema,
  //         properties: {
  //           ...prevSchema.properties,
  //           role: {
  //             ...prevSchema.properties.role,
  //             oneOf: rolesOptions,
  //           },
  //         },
  //       }));
  //     }
  //   };

  //   fetchRoles();
  // }, [Addmodalopen]);

  const fetchUserList = async () => {
    setLoading(true);
    try {
      setCohortData([]);
      const limit = 0;
      // const offset = pageOffset * limit;
      const offset = pageOffset * pageSize;
      const sort = sortBy;

      const data = {
        limit: limit,
        offset: offset,
        sort: sort,
        filters: filters,
      };

      // Call getCohortList API
      const resp = await getCohortList(data);

      if (resp) {
        const result = resp?.results;

        // Map response data to required format
        const resultData = result?.map((item: any) => ({
          name: item?.name,
          type: item?.type === "cohort" ? "Cohort" : item?.type,
          status: item?.status,
          tenantId: item?.tenantId,
          updatedBy: item?.updatedBy,
          createdBy: item?.createdBy,
          createdAt: item?.createdAt,
          updatedAt: item?.updatedAt,
          cohortId: item?.cohortId,
        }));

        setCohortData(resultData || []);
        const totalCount = resp?.count;
        setTotalCound(totalCount);
        setPagination(totalCount >= 5);
        setPageSizeArray(
          totalCount >= 15
            ? [5, 10, 15]
            : totalCount >= 10 && totalCount < 15
              ? [5, 10]
              : totalCount >= 5 && totalCount < 10
                ? [5]
                : []
        );
        const pageCount =
          totalCount > 0 ? Math.ceil(totalCount / pageLimit) : 1;
        setPageCount(pageCount);

        // if (pageOffset >= pageCount) {
        //   setPageOffset(pageCount - 1);
        // }
      } else {
        setCohortData([]);
      }
    } catch (error) {
      console.error("Error fetching cohort list:", error);
      setCohortData([]);
    } finally {
      setLoading(false);
    }
  };

  const getCohortMemberlistData = async (cohortId: string) => {
    const data = {
      limit: 0,
      offset: 0,
      filters: {
        cohortId: cohortId,
      },
    };
    const response = await fetchCohortMemberList(data);
    // const response = await queryClient.fetchQuery({
    //   queryKey: [
    //     QueryKeys.GET_COHORT_MEMBER_LIST,
    //     data.limit,
    //     data.offset,
    //     JSON.stringify(data.filters),
    //   ],
    //   queryFn: () => fetchCohortMemberList(data),
    // });

    if (response?.result) {
      const userDetails = response.result.userDetails;
      const getActiveMembers = userDetails?.filter(
        (member: any) =>
          member?.status === Status.ACTIVE && member?.role === Role.STUDENT
      );
      const totalActiveMembers = getActiveMembers?.length || 0;

      const getArchivedMembers = userDetails?.filter(
        (member: any) =>
          member?.status === Status.ARCHIVED && member?.role === Role.STUDENT
      );
      const totalArchivedMembers = getArchivedMembers?.length || 0;

      return {
        totalActiveMembers,
        totalArchivedMembers,
      };
    }

    return {
      totalActiveMembers: 0,
      totalArchivedMembers: 0,
    };
  };

  const getAddCenterFormData = async () => {
    try {
      const response = await getFormRead("cohorts", "cohort");
      if (response) {
        const { schema, uiSchema } = GenerateSchemaAndUiSchema(response, t);
      } else {
        console.log("Unexpected response format");
      }
    } catch (error) {
      showToastMessage(t("COMMON.ERROR_MESSAGE_SOMETHING_WRONG"), "error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (
        selectedBlockCode !== "" ||
        (selectedDistrictCode !== "" && selectedBlockCode === "")
      ) {
        await fetchUserList();
      }
      await fetchUserList();
      // getFormData();
    };

    fetchData();
  }, [
    pageOffset,
    pageLimit,
    sortBy,
    filters,
    filters.states,
    filters.status,
    createCenterStatus,
  ]);

  // handle functions
  const handleChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
    setPageLimit(Number(event.target.value));
    setPageOffset(0);
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    if (value >= 1 && value <= pageCount) {
      setPageOffset(value - 1);
    }
  };

  const PagesSelector = () => (
    <Box sx={{ display: { xs: "block" } }}>
      <Pagination
        // size="small"
        color="primary"
        count={pageCount}
        page={pageOffset + 1}
        onChange={handlePaginationChange}
        siblingCount={0}
        boundaryCount={1}
        disabled={pageCount === 0}
        sx={{ marginTop: "10px" }}
      />
    </Box>
  );

  const PageSizeSelectorFunction = () => (
    <Box mt={2}>
      <PageSizeSelector
        handleChange={handleChange}
        pageSize={pageSize}
        options={pageSizeArray}
      />
    </Box>
  );

  const handleStateChange = async (selected: string[], code: string[]) => {
    const newQuery = { ...router.query };

    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.district) {
      delete newQuery.district;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }
    router.replace({
      pathname: router.pathname,
      query: {
        ...newQuery,
        state: "",
      },
    });
    // setSelectedDistrict([]);
    // setSelectedBlock([]);
    // setSelectedState(selected);

    // setSelectedCenterCode([])

    setSelectedBlockCode("");
    setSelectedDistrictCode("");

    if (selected[0] === "") {
      if (filters.status)
        setFilters({ type: "cohort", status: filters.status });
      // else setFilters({ role: role });
    } else {
      const stateCodes = code?.join(",");
      setSelectedStateCode(stateCodes);
      if (filters.status)
        setFilters({
          type: "cohort",
          states: "",
          status: filters.status,
        });
      else setFilters({ type: "cohort", states: "" });
    }
  };

  const handleDistrictChange = (selected: string[], code: string[]) => {
    const newQuery = { ...router.query };
    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }
    setSelectedBlock([]);
    setSelectedDistrict(selected);
    setSelectedBlockCode("");
    // localStorage.setItem('selectedDistrict', selected[0])

    setSelectedDistrictStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_DISTRICTS")) {
      if (filters.status) {
        setFilters({
          states: "",
          status: filters.status,
          type: "cohort",
        });
      } else {
        setFilters({
          states: "",
          type: "cohort",
        });
      }
      if (newQuery.district) {
        delete newQuery.district;
      }
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          state: "",
        },
      });
    } else {
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          // state: selectedStateCode,
          // district: code?.join(",")
        },
      });
      const districts = code?.join(",");
      setSelectedDistrictCode(districts);
      if (filters.status) {
        setFilters({
          states: "",
          districts: "",
          status: filters.status,
          type: "cohort",
        });
      } else {
        setFilters({
          states: "",
          districts: "",
          type: "cohort",
        });
      }
    }
    setPageOffset(Numbers.ZERO);
    // fetchUserList();
  };
  const handleBlockChange = (selected: string[], code: string[]) => {
    setSelectedBlock(selected);
    const newQuery = { ...router.query };
    if (newQuery.center) {
      delete newQuery.center;
    }
    if (newQuery.block) {
      delete newQuery.block;
    }

    localStorage.setItem("selectedBlock", selected[0]);
    setSelectedBlockStore(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_BLOCKS")) {
      if (newQuery.block) {
        delete newQuery.block;
      }
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          // state: selectedStateCode,
          // district: selectedDistrictCode,
        },
      });
      if (filters.status) {
        setFilters({
          states: "",
          districts: "",
          status: filters.status,
          type: "cohort",
        });
      } else {
        setFilters({
          states: "",
          districts: "",
          type: "cohort",
        });
      }
    } else {
      router.replace({
        pathname: router.pathname,
        query: {
          ...newQuery,
          // state: selectedStateCode,
          // district: selectedDistrictCode,
          // block: code?.join(",")
        },
      });
      // const blocks = code?.join(",");
      // setSelectedBlockCode(blocks);
      if (filters.status) {
        setFilters({
          states: "",
          districts: "",
          blocks: "",
          status: filters.status,
          type: "cohort",
        });
      } else {
        setFilters({
          states: "",
          districts: "",
          blocks: "",
          type: "cohort",
        });
      }
    }
  };

  const handleTenantChange = (
    selectedNames: string[],
    selectedCodes: string[]
  ) => {
    if (selectedNames && selectedCodes) {
      const tenantId = selectedCodes.join(",");

      setSelectedTenant(selectedNames);

      setFilters((prevFilter) => ({
        ...prevFilter,
        tenantId: tenantId,
      }));
    } else {
      console.log("No valid tenants selected");
    }
  };

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
    setIsCreateCohortAdminModalOpen(false);
    setUpdateBtnDisabled(true);
  };

  const handleActionForDelete = async () => {
    if (selectedCohortId) {
      let cohortDetails = {
        status: Status.ARCHIVED,
      };
      const tenantid = selectedRowData?.tenantId;
      const resp = await deleteCohort(selectedCohortId, tenantid);
      if (resp?.responseCode === 200) {
        showToastMessage(t("COHORTS.DELETE_SUCCESSFULLY"), "success");
        const cohort = cohortData?.find(
          (item: any) => item.cohortId == selectedCohortId
        );
        if (cohort) {
          cohort.status = Status.ARCHIVED;
        }
      } else {
        showToastMessage("Cohort Not Archived", "error");
      }
      setSelectedCohortId("");
    } else {
      setSelectedCohortId("");
    }
    fetchUserList();
  };

  const handleSortChange = async (event: SelectChangeEvent) => {
    if (cohortData?.length > 0) {
      if (event.target.value === "Z-A") {
        setSortBy(["name", SORT.DESCENDING]);
      } else if (event.target.value === "A-Z") {
        setSortBy(["name", SORT.ASCENDING]);
      } else {
        setSortBy(["createdAt", SORT.ASCENDING]);
      }
    }
    setSelectedSort(event.target.value);
  };

  const handleSearch = (keyword: string) => {
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);
    if (keyword?.length > 3) {
      if (cohortData?.length > 0) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          name: keyword,
        }));
      }
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        name: keyword,
      }));
    }
  };

  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);

    setSelectedFilter(newValue);
    setPageSize(Numbers.TEN);
    setPageLimit(Numbers.TEN);
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);

    if (newValue === Status.ACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ACTIVE],
      }));
    } else if (newValue === Status.INACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.INACTIVE],
      }));
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
    } else if (newValue === Status.ALL_LABEL) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: "",
      }));
    } else {
      setFilters((prevFilters) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
    }
  };

  const handleEdit = async (rowData: any) => {
    setLoading(true);
    // Handle edit action here
    // setIsEditModalOpen(true);
    if (rowData) {
      setSelectedRowData(rowData);
      const cohortId = rowData?.cohortId;
      setSelectedCohortId(cohortId);
      const cohortName = rowData?.name;
      setInputName(cohortName);

      let data = {
        filters: {
          cohortId: cohortId,
          type: "cohort",
        },
        limit: Numbers.TWENTY,
        offset: 0,
      };
      const resp = await getCohortList(data);

      setFormData({
        ...rowData,
        status: rowData?.status ? rowData?.status : "active",
      });
      setEditFormData(mapFields(schema, rowData));
      setLoading(false);
      setIsEditForm(true);
    }
    setLoading(false);
    setConfirmButtonDisable(false);
  };

  const handleDelete = (rowData: any) => {
    setLoading(true);

    const cohortName = rowData?.name;
    // SetDeletedRowData
    setInputName(cohortName);
    setConfirmationModalOpen(true);
    if (rowData) {
      setSelectedRowData(rowData);
      const cohortId = rowData?.cohortId;
      setSelectedCohortId(cohortId);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleAdd = (rowData: any) => {
    // const tenantId = rowData?.tenantId;
    // const currentTenantId = localStorage.getItem("tenantId");
    // setPreviousTenantId(currentTenantId);
    // if (tenantId) {
    //   localStorage.setItem("tenantId", tenantId);
    //   console.log("Modal opened, Tenant ID set:", tenantId);
    // }
    setSelectedRowData({ ...rowData });
    setLoading(true);
    setAddmodalopen(true);
    setLoading(false);
  };

  // add  extra buttons
  const extraActions: any = [
    { name: t("COMMON.ADD"), onClick: handleAdd, icon: AddIcon },
    { name: t("COMMON.EDIT"), onClick: handleEdit, icon: EditIcon },
    { name: t("COMMON.DELETE"), onClick: handleDelete, icon: DeleteIcon },
  ];

  const onCloseEditMOdel = () => {
    setIsEditModalOpen(false);
    setUpdateBtnDisabled(true);
  };

  const onCloseEditForm = () => {
    setIsEditForm(false);
    setUpdateBtnDisabled(true);
  };
  const handleInputName = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedName = event.target.value;
    setInputName(updatedName);
  };

  const handleChangeForm = (event: IChangeEvent<any>) => {
    setUpdateBtnDisabled(false);
    setAddBtnDisabled(false);
  };
  const handleError = (error: any) => {
    console.log("error", error);
    setError(error);
  };
  const handleUpdateAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      if (!selectedCohortId) {
        showToastMessage(t("CENTERS.NO_COHORT_ID_SELECTED"), "error");
        return;
      }

      const getChangedFields = (newData: any, oldData: any) => {
        const changes: Record<string, any> = {};
        Object.keys(newData).forEach((key) => {
          if (newData[key] !== oldData[key]) {
            changes[key] = newData[key];
          }
        });
        return changes;
      };

      const changedFields = getChangedFields(formData, editFormData);

      if (Object.keys(changedFields).length === 0) {
        showToastMessage(t("USER.NO_CHANGES_TO_UPDATE"), "info");
        setLoading(false);
        return;
      }

      const tenantid = selectedRowData?.tenantId;
      const resp = await updateCohortUpdate(
        selectedCohortId,
        changedFields,
        tenantid
      );
      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("COHORTS.COHORT_UPDATED_SUCCESSFULLY"), "success");
      } else {
        showToastMessage(t("COHORTS.COHORT_UPDATED_FAILED"), "error");
      }
    } catch (error: any) {
      const errorMessage = error.message || t("COHORTS.COHORT_UPDATED_FAILED");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      onCloseEditMOdel();
      fetchUserList();
      setIsEditForm(false);
    }
  };

  const handleAddUserClick = () => {
    setOpenAddNewCohort(true);
  };

  // useEffect(() => {
  //   const fetchData = () => {
  //     try {
  //       const object = {
  //         // "limit": 20,
  //         // "offset": 0,
  //         fieldName: "states",
  //       };
  //       // const response = await getStateBlockDistrictList(object);
  //       // const result = response?.result?.values;
  //       if (typeof window !== "undefined" && window.localStorage) {
  //         const admin = localStorage.getItem("adminInfo");
  //         if (admin) {
  //           const stateField = JSON.parse(admin).customFields.find(
  //             (field: any) => field.label === "STATES"
  //           );
  //           if (!stateField.value.includes(",")) {
  //             setSelectedState([stateField.value]);
  //             setSelectedStateCode(stateField.code);
  //             if (
  //               selectedDistrictCode &&
  //               selectedDistrict.length !== 0 &&
  //               selectedDistrict[0] !== t("COMMON.ALL_DISTRICTS")
  //             ) {
  //               setFilters({
  //                 states: "",
  //                 districts: "",
  //                 status: filters.status,
  //                 type: "cohort",
  //               });
  //             }
  //             if (
  //               selectedBlockCode &&
  //               selectedBlock.length !== 0 &&
  //               selectedBlock[0] !== t("COMMON.ALL_BLOCKS")
  //             ) {
  //               setFilters({
  //                 states: "",
  //                 districts: "",
  //                 blocks: "",
  //                 status: filters.status,
  //                 // type: CohortTypes.COHORT,
  //                 type: "cohort",
  //               });
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchData();
  // }, [selectedBlockCode, selectedDistrictCode]);

  const handleMemberClick = async (
    type: "active" | "archived",
    count: number,
    cohortId: string
  ) => {
    if (!count) {
      console.error("No members available for this cohort.");
      return;
    }

    try {
      let data = {
        limit: 0,
        offset: 0,
        filters: {
          cohortId: cohortId,
        },
      };

      const result = await getCohortList(data);
      // const result = await queryClient.fetchQuery({
      //   queryKey: [
      //     QueryKeys.GET_COHORT_LIST,
      //     data.limit,
      //     data.offset,
      //     data.filters,
      //   ],
      //   queryFn: () => getCohortList(data),
      // });

      if (!result || !result.results || !result.results.cohortDetails) {
        console.log("Invalid response structure or no cohort details found.");
      }

      const customFields = result?.results?.cohortDetails?.[0]?.customFields;

      // Check if customFields exist
      if (!customFields || customFields.length === 0) {
        console.log("No custom fields found for this cohort.");
      }

      const urlData: any = { type: type };

      customFields?.forEach((item: any) => {
        if (item?.label === "STATES") {
          urlData.stateCode = item?.code;
        } else if (item?.label === "DISTRICTS") {
          urlData.districtCode = item?.code;
        } else if (item?.label === "BLOCKS") {
          urlData.blockCode = item?.code;
        }
      });

      if (!urlData.stateCode || !urlData.districtCode || !urlData.blockCode) {
        throw new Error(
          "Incomplete location data (state, district, block) for the cohort."
        );
      }

      if (urlData) {
        //  localStorage.setItem("selectedBlock", selectedBlock[0])
        // router.push(
        //   `learners?state=${urlData.stateCode}&district=${urlData.districtCode}&block=${urlData.blockCode}&status=${urlData.type}`
        // );
      }
    } catch (error) {
      console.log("Error handling member click:", error);
    }
  };
  const handleAddmodal = () => {
    // if (previousTenantId) {
    //   localStorage.setItem("tenantId", previousTenantId);
    //   console.log("Modal closed, Tenant ID restored:", previousTenantId);
    // } else {
    //   localStorage.removeItem("tenantId");
    //   console.log("Modal closed, Tenant ID removed");
    // }
    setAddmodalopen(false);
    setAddBtnDisabled(true);
    setAddFormData({});
  };

  const handleAddAction = async (data: any) => {
    setLoading(true);
    const formData = data?.formData;
    try {
      setLoading(true);
      setConfirmButtonDisable(true);

      interface UserCreateData {
        name: string;
        username: string;
        password: string;
        mobile: string;
        email: string;
        tenantCohortRoleMapping: Array<{
          roleId: string;
          tenantId: string;
          cohortId: string[];
        }>;
      }

      const matchedRole = roleList?.result?.find(
        (role: any) => role.code === formData?.role
      );
      const roleId = matchedRole ? matchedRole?.roleId : "";

      let obj: UserCreateData = {
        name: formData?.name.replace(/\s/g, ""),
        mobile: formData?.mobileNo,
        email: formData?.email,
        username: formData?.username.replace(/\s/g, ""),
        password: formData?.password,
        tenantCohortRoleMapping: [
          {
            roleId: roleId,
            tenantId: selectedRowData?.tenantId,
            cohortId: [selectedRowData?.cohortId],
          },
        ],
      };
      const resp = await userCreate(obj as any, selectedRowData?.tenantId);
      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(t("USER.CREATE_SUCCESSFULLY"), "success");
        setLoading(false);
      } else if (resp?.responseCode === 403) {
        showToastMessage(t("USER.USER_ALREADY_EXIST"), "error");
      } else {
        showToastMessage(t("USER.FAILED_TO_CREATE"), "error");
      }
    } catch (error: any) {
      const errorMessage = error.message || t("USER.FAILED_TO_CREATE");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      handleAddmodal();
      onCloseEditMOdel();
      setError([]);
      setIsEditForm(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const result = await getTenantLists(filters);
      setListOfTenants(result);
    };

    fetchData();
  }, [filters]);

  const handleCreateCohortAdmin = (rowData: any) => {
    setSelectedRowData(rowData);
    setIsCreateCohortAdminModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const roleObj = {
        limit: "10",
        page: 1,
        filters: {
          tenantId: selectedRowData?.tenantId,
        },
      };

      const response = await rolesList(roleObj, selectedRowData?.tenantId);
      setRolelist(response);
    };
    fetchData();
  }, [isCreateCohortAdminModalOpen, Addmodalopen]);

  const handleAddCohortAdminAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;

    try {
      setLoading(true);
      setConfirmButtonDisable(true);

      const cohortAdminRole = roleList?.result.find(
        (item: any) => item.code === "cohort_admin"
      );

      let obj = {
        name: formData?.name.replace(/\s/g, ""),
        username: formData?.username.replace(/\s/g, ""),
        password: formData?.password,
        mobile: formData?.mobileNo,
        email: formData?.email,

        tenantCohortRoleMapping: [
          {
            roleId: cohortAdminRole?.roleId,
            tenantId: selectedRowData?.tenantId,
            cohortId: [selectedRowData?.cohortId],
          },
        ],
      };
      const resp = await userCreate(obj as any, selectedRowData?.tenantId);

      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        showToastMessage(
          t("COHORTS.COHORT_ADMIN_CREATE_SUCCESSFULLY"),
          "success"
        );
        setLoading(false);
      } else {
        showToastMessage(t("COHORTS.COHORT_ADMIN_CREATE_FAILED"), "error");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || t("TENANT.TENANT_ADMIN_FAILED_TO_CREATE");
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      handleCloseModal();
      onCloseEditMOdel();
      fetchUserList();
      setIsEditForm(false);
    }
  };

  const userProps = {
    tenants: listOfTenants,
    userType: t("COHORTS.COHORTS"),
    searchPlaceHolder: t("COHORTS.SEARCH_COHORT"),
    showTenantCohortDropDown: true,
    isTenantShow: true,
    // selectedState: selectedState,
    selectedStateCode: selectedStateCode,
    selectedDistrict: selectedDistrict,
    // selectedDistrictCode: selectedDistrictCode,
    // selectedBlockCode: selectedBlockCode,
    selectedBlock: selectedBlock,
    selectedSort: selectedSort,
    selectedFilter: selectedFilter,
    statusArchived: true,
    statusInactive: true,
    selectedTenant: selectedTenant,
    handleTenantChange: handleTenantChange,
    // handleStateChange: handleStateChange,
    handleDistrictChange: handleDistrictChange,
    handleBlockChange: handleBlockChange,
    handleSortChange: handleSortChange,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    showAddNew: false,
    handleAddUserClick: handleAddUserClick,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    showSort: true,
    selectedBlockCode: selectedBlockCode,
    setSelectedBlockCode: setSelectedBlockCode,
    selectedDistrictCode: selectedDistrictCode,
    setSelectedDistrictCode: setSelectedDistrictCode,
    setSelectedStateCode: setSelectedStateCode,
    setSelectedDistrict: setSelectedDistrict,
    setSelectedBlock: setSelectedBlock,
  };

  return (
    <>
      <ConfirmationModal
        message={
          selectedRowData?.totalActiveMembers > 0
            ? t("CENTERS.YOU_CANT_DELETE_CENTER_HAS_ACTIVE_LEARNERS", {
                activeMembers: `${selectedRowData?.totalActiveMembers}`,
              })
            : t("CENTERS.SURE_DELETE_CENTER") +
              inputName +
              " " +
              t("CENTERS.CENTER") +
              "?"
        }
        handleAction={handleActionForDelete}
        buttonNames={
          selectedRowData?.totalActiveMembers > 0
            ? { secondary: t("COMMON.CANCEL") }
            : { primary: t("COMMON.YES"), secondary: t("COMMON.CANCEL") }
        }
        handleCloseModal={handleCloseModal}
        modalOpen={confirmationModalOpen}
      />

      <HeaderComponent {...userProps}>
        {loading ? (
          <Box
            width={"100%"}
            id="check"
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Loader showBackdrop={false} loadingText={t("COMMON.LOADING")} />
          </Box>
        ) : cohortData?.length > 0 ? (
          <KaTableComponent
            columns={getCohortTableData(t, isMobile, adminRole, filters)}
            addAction={filters?.status?.[0] != "inactive" ? true : false}
            data={cohortData}
            limit={pageLimit}
            roleButton
            offset={pageOffset}
            addCohortBtnFunc={handleCreateCohortAdmin}
            paginationEnable={totalCount > Numbers.TEN}
            PagesSelector={PagesSelector}
            pagination={pagination}
            PageSizeSelector={PageSizeSelectorFunction}
            pageSizes={pageSizeArray}
            extraActions={extraActions}
            showIcons={true}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            handleMemberClick={handleMemberClick}
          />
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="20vh"
          >
            <Typography marginTop="10px" textAlign={"center"}>
              {t("COMMON.NO_COHORT_FOUND")}
            </Typography>
          </Box>
        )}

        <AddNewCenters
          open={openAddNewCohort}
          onClose={handleCloseAddLearnerModal}
          formData={formdata}
          isEditModal={true}
          userId={userId}
        />

        <SimpleModal
          open={isEditForm}
          onClose={onCloseEditForm}
          showFooter={false}
          modalTitle={t("COHORTS.UPDATE_COHORT")}
        >
          {cohortUpdateSchema && uiSchema && (
            <DynamicForm
              schema={cohortUpdateSchema}
              uiSchema={uiSchema}
              onSubmit={handleUpdateAction}
              onChange={handleChangeForm}
              onError={handleError}
              widgets={{}}
              showErrorList={true}
              customFields={customFields}
              formData={editFormData}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right", // Centers the button horizontally
                  marginTop: "20px",
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="submit"
                  form="update-center-form"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={onCloseEditForm}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  form="update-center-form"
                  disabled={updateBtnDisabled}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                  }}
                >
                  {t("COMMON.UPDATE")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>

        <SimpleModal
          open={Addmodalopen}
          onClose={handleAddmodal}
          showFooter={false}
          modalTitle={t("USER.ADD_NEW_USER")}
        >
          {userSchema && userUiSchema && (
            <DynamicForm
              schema={userSchema}
              uiSchema={userUiSchema}
              onSubmit={handleAddAction}
              onChange={handleChangeForm}
              onError={handleError}
              widgets={{}}
              showErrorList={false}
              customFields={customFields}
              formData={addFormData}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right",
                  marginTop: "20px",
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="button"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={handleAddmodal}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={addBtnDisabled}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                  }}
                >
                  {t("COMMON.ADD")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>

        <SimpleModal
          open={isCreateCohortAdminModalOpen}
          onClose={handleCloseModal}
          showFooter={false}
          modalTitle={t("COHORTS.ADD_NEW_COHORT_ADMIN")}
        >
          {cohortAdminSchema && cohortAdminUiSchema && (
            <DynamicForm
              schema={cohortAdminSchema}
              uiSchema={cohortAdminUiSchema}
              onSubmit={handleAddCohortAdminAction}
              onChange={handleChangeForm}
              onError={handleError}
              widgets={{}}
              showErrorList={false}
              customFields={customFields}
              formData={addFormData}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right",
                  marginTop: "20px",
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="button"
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={handleCloseModal}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={addBtnDisabled}
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                    color: "white",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                  }}
                >
                  {t("COMMON.ADD")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>
      </HeaderComponent>
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Center;
