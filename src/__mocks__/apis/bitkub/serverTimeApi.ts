import nock from "nock";
import { TEST_API_URL } from "./constants";

export const createApi = (reqheaders = {}, fixedTimestamp = "1529999999") => {
  nock(TEST_API_URL, {
    reqheaders,
  })
    .get("/servertime")
    .reply(200, fixedTimestamp);
};
