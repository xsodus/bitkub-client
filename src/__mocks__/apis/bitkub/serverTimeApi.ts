import nock from "nock";
import { TEST_API_URL } from "./constants";

export const createApi = (fixedTimestamp = "1699376552354") => {
  nock(TEST_API_URL).persist().get("/v3/servertime").reply(200, fixedTimestamp);
};
