import config from "@/utils/urlConstants.json";
import axios from "axios";
export const bulkUpload = async (formData: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/${config.URLS.BULK_CREATE}`;

  const tenantId = formData.get("tenantId") as string;
  try {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantid: tenantId,
    };
    const response = await axios.post(apiUrl, formData, { headers });
    return response?.data;
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.params?.err || "Error from API.";
    }
    throw new Error(errorMessage);
  }
};
