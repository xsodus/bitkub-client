
import nock from "nock";
import { TEST_API_URL } from "./constants";

/**
 * Creates a mock API for the server time endpoint using `nock`.
 * 
 * @param {string} [fixedTimestamp="1699376552354"] - The fixed timestamp to be returned by the mock API.
 * @returns {void}
 */
export const createApi = (fixedTimestamp = "1699376552354") => {
  nock(TEST_API_URL).persist().get("/v3/servertime").reply(200, fixedTimestamp);
};
