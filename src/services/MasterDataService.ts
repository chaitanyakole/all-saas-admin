import { deleteApi, patch, post, put } from "./RestClient";
import config from "@/utils/urlConstants.json"
export interface CenterListParam {
  limit?: number;
  filters?: any;
  offset?: number;
}

export interface StateListParam {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string;
  fieldName: string;
  optionName?: string;
  sort?: [string, string]; //
}

export interface DistrictListParam {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string;
  fieldName: string;
  optionName?: string;
  sort?: [string, string]; //
}

export const getStateBlockDistrictList = async ({
  controllingfieldfk,
  fieldName,
  limit,
  offset,
  optionName,
  sort,
}: StateListParam): Promise<any> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.FIELDS_OPTIONS}`;

  const requestBody: StateListParam = {
    fieldName,
    limit,
    offset,
    sort,
  };
  if (controllingfieldfk) {
    requestBody.controllingfieldfk = controllingfieldfk;
  }
  if (optionName) {
    requestBody.optionName = optionName;
  }
  try {
    const response = await post(apiUrl, requestBody);
    return response?.data;
  } catch (error) {
    console.error("Error in fetching state, block, and district list", error);
    throw error;
  }
};
// getDistrictsForState
export const getDistrictsForState = async ({
  limit,
  offset,
  controllingfieldfk,
  fieldName,
  optionName,
  sort,
}: {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string | undefined;
  fieldName: string;
  optionName?: string;
  sort?: [string, string];
}): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.FIELDS_OPTIONS}`;

  const requestBody: {
    limit?: number;
    offset?: number;
    controllingfieldfk?: string;
    fieldName: string;
    optionName?: string;
    sort?: [string, string];
  } = {
    fieldName,
    limit,
    offset,
  };

  if (controllingfieldfk) {
    requestBody.controllingfieldfk = controllingfieldfk;
  }
  if (optionName) {
    requestBody.optionName = optionName;
  }
  if (sort) {
    requestBody.sort = sort;
  }

  try {
    const response = await post(apiUrl, requestBody);
    return response?.data;
  } catch (error) {
    console.error("Error fetching blocks for districts", error);
    throw error;
  }
};

export const getBlocksForDistricts = async ({
  limit,
  offset,
  controllingfieldfk,
  fieldName,
  optionName,
  sort,
}: {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string | undefined;
  fieldName: string;
  optionName?: string;
  sort?: [string, string];
}): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.FIELDS_OPTIONS}`;

  const requestBody: {
    limit?: number;
    offset?: number;
    controllingfieldfk?: string;
    fieldName: string;
    optionName?: string;
    sort?: [string, string];
  } = {
    limit,
    offset,
    fieldName,
  };

  if (controllingfieldfk) {
    requestBody.controllingfieldfk = controllingfieldfk;
  }
  if (optionName) {
    requestBody.optionName = optionName;
  }
  if (sort) {
    requestBody.sort = sort;
  }

  try {
    const response = await post(apiUrl, requestBody);
    return response?.data;
  } catch (error) {
    console.error("Error fetching blocks for districts", error);
    throw error;
  }
};

export const getCenterList = async ({
  filters,
  limit,
  offset,
}: CenterListParam): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.COHORT_SEARCH}`;
  try {
    const response = await post(apiUrl, {
      filters,
      limit,
      offset,
    });
    return response?.data;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};

export const deleteOption = async (
  type: "states" | "districts" | "blocks",
  option: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.FIELDS_OPTIONS_DELETE}/${type}?option=${option}`;
  const requestBody = {};
  const requestHeaders = {};

  try {
    const response = await deleteApi(apiUrl, requestBody, requestHeaders);
    return response?.data;
  } catch (error) {
    console.error(`Error deleting ${type}`, error);
    return error;
  }
};

export const createOrUpdateOption = async (
  fieldId: string,
  fieldParams: {
    options: { name: string; value: string; controllingfieldfk?: string }[];
  }
  // stateId?: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.FIELDS_UPDATES}/${fieldId}`;

  console.log("API URL:", apiUrl);
  console.log("Request Body:", { fieldParams });

  try {
    const response = await patch(apiUrl, { fieldParams });
    console.log("api response", response?.data);
    return response?.data;
  } catch (error: any) {
    console.error(
      "Error in createOrUpdateOption:",
      error.message,
      error.response?.data
    );
    throw new Error("Failed to update options");
  }
};

export const updateCohort = async (
  cohortId: string,
  cohortDetails: any
): Promise<any> => {
  let apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.COHORT_UPDATE}/${cohortId}`;

  try {
    const response = await put(apiUrl, cohortDetails);
    return response?.data;
  } catch (error) {
    console.error("Error in updating cohort details", error);
    throw error;
  }
};
