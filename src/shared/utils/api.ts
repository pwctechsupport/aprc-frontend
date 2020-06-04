import axios from "axios";
import store from "../../redux/index";
import { APP_REST_URL } from "../../settings";

const MyApi = axios.create({
  baseURL: APP_REST_URL,
  onDownloadProgress: console.info
});

MyApi.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  const headers = token
    ? { Authorization: "Bearer " + token, "Content-Type": "application/json" }
    : {};
  config.headers = headers;
  return config;
});

export default MyApi;
