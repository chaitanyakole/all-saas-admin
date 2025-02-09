import { SendCredentialsRequest } from '@/utils/Interfaces';
import { post } from './RestClient';
import config from "@/utils/urlConstants.json"
export const sendCredentialService = async ({
  isQueue,
  context,
  key,
  replacements,
  email,
}: SendCredentialsRequest): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_NOTIFICATION_BASE_URL}/${config.URLS.NOTIFICATIONS_SEND}`;
  try {
    const response = await post(apiUrl, {
      isQueue,
      context,
      key,
      replacements,
      email,
    });
    return response?.data;
  } catch (error) {
    console.error('error in getting Assesment List Service list', error);

    return error;
  }
};
