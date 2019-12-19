import axios from "axios";
import store from "../../redux/index";

const MyApi = axios.create({
  baseURL: "http://mandalorian.rubyh.co/api",
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
