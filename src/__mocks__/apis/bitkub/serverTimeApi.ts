import nock from "nock";
import { TEST_API_URL } from "./constants";

export const createApi = (reqheaders = null, fixedTimestamp = "1529999999") => {
  var nockApi = reqheaders
    ? nock(TEST_API_URL, {
        reqheaders,
      })
    : nock(TEST_API_URL);

  nockApi.get("/servertime").reply(200, fixedTimestamp);
};
