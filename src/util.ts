import { AxiosResponse } from 'axios';

export const isSuccessfulResponse = (response: AxiosResponse): boolean => {
  return response && response.status >= 200 && response.status < 300;
};
