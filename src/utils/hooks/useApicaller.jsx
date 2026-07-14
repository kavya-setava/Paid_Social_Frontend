import { useState } from "react";
import axios from "axios";

 const BASE_URL = "http://localhost:5000/api/";
// const BASE_URL = "https://netflix-backend-yt-1.onrender.com/api/";

const useApiCaller = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (
    method = "get",
    endpoint,
    body = {}
  ) => {

    try {

      setIsLoading(true);

      let token = localStorage.getItem("authToken");

      const response = await axios({
        method,
        url: BASE_URL + endpoint,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: body,
        withCredentials: true,
      });

      return response.data;

    } catch (error) {

      // ACCESS TOKEN EXPIRED
      if (error?.response?.status === 401) {

        try {

          const refreshToken =
            localStorage.getItem("refreshToken");

          // CALL REFRESH API
          const refreshResponse = await axios.post(
            BASE_URL + "auth/refresh",
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${refreshToken}`,
              },
              withCredentials: true,
            }
          );

          console.log(
            "REFRESH RESPONSE",
            refreshResponse.data
          );

          // backend sets new access token in cookie
          // OR returns token

          const newAccessToken =
            refreshResponse?.data?.accessToken;

          // store new token if exists
          if (newAccessToken) {
            localStorage.setItem(
              "authToken",
              newAccessToken
            );
          }

          // RETRY ORIGINAL API
          const retryResponse = await axios({
            method,
            url: BASE_URL + endpoint,
            headers: {
              Authorization:
                `Bearer ${
                  newAccessToken ||
                  localStorage.getItem("authToken")
                }`,
              "Content-Type": "application/json",
            },
            data: body,
            withCredentials: true,
          });

          return retryResponse.data;

        } catch (refreshError) {

          console.error(
            "Refresh token expired",
            refreshError
          );

          localStorage.clear();

        //   window.location.href = "/login";

          return null;
        }
      }

      return error?.response?.data;

    } finally {

      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchData,
  };
};

export default useApiCaller;