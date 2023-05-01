import nock from "nock";
import { TEST_API_URL } from "./constants";

export const createApi = () => {
  nock(TEST_API_URL).get("/servertime").reply(200, "1529999999");
};
