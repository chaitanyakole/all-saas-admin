import { updateInvitationStatusParams } from "@/utils/Interfaces";
import { get } from "./RestClient";
import config from "@/utils/urlConstants.json";
import axios from "axios";
import { cohortListData } from "./CohortService/cohortService";
export const updateInvitation = async ({
  invitationId,
  invitationStatus,
  tenantId,
}: updateInvitationStatusParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.UPDATE_INVITATIONS_STATUS}${invitationId}`;

  try {
    const token = localStorage.getItem("token");

    const response = await axios.patch(
      apiUrl,
      { invitationStatus }, // Direct object instead of JSON.stringify
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
          tenantId,
        },
      }
    );

    return response?.data;
  } catch (error) {
    console.error("Error in updating invitation status:", error);
    return error;
  }
};

export const fetchInvitationsRequest = async (): Promise<any> => {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.FETCH_INVITATIONS}`;
  try {
    const response = await get(apiUrl, headers);
    return response?.data?.result;
  } catch (error) {
    return error;
  }
};

export const sendRequest = async (
  data: cohortListData,
  userTenantId: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.SEND_INVITATION_REQUEST}`;

  try {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      tenantid: userTenantId,
    };

    const response = await axios.post(apiUrl, data, { headers });
    return response?.data;
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred.";

    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.params?.err || "Error from API.";
    }

    console.error("Error in creating user:", error);
    throw new Error(errorMessage);
  }
};
