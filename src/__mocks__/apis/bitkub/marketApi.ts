import nock from "nock";
import { TEST_API_URL } from "./constants";

import bitkubBalanceResponse from "./reponses/bitkubBalanceResponse.json";
import bitkubPlaceBidResponse from "./reponses/bitkubBuyResponse.json";
import bitkubCancelOrderResponse from "./reponses/bitkubCancelOrderResponse.json";
import bitkubPlaceAskResponse from "./reponses/bitkubSellResponse.json";
import bitkubTestPlaceBidResponse from "./reponses/bitkubTestBuyResponse.json";
import bitkubSymbolsResponse from "./reponses/bitkubSymbolsResponse.json";

/**
 * Creates a mock API for the market endpoint using `nock`.
 * 
 * @returns {void}
 */
export const createApi = () => {
  nock(TEST_API_URL).get("/market/symbols").reply(200, bitkubSymbolsResponse);
  nock(TEST_API_URL)
    .get("/market/bids")
    .query({ sym: "THB_BTC", lmt: "1" })
    .reply(200, { error: 0, result: [["mock-bid-id", 1699376552, 0.001, 50000, 50]] });
  nock(TEST_API_URL)
    .get("/market/asks")
    .query({ sym: "THB_BTC", lmt: "1" })
    .reply(200, { error: 0, result: [["mock-ask-id", 1699376552, 0.001, 50000, 50]] });

  nock(TEST_API_URL)
    .post("/v3/market/place-ask")
    .reply(200, bitkubPlaceAskResponse);
  nock(TEST_API_URL)
    .post("/v3/market/balances")
    .reply(200, bitkubBalanceResponse);
  nock(TEST_API_URL)
    .post("/v3/market/place-bid")
    .reply(200, bitkubPlaceBidResponse);
  nock(TEST_API_URL)
    .post("/v3/market/place-bid/test")
    .reply(200, bitkubTestPlaceBidResponse);
  nock(TEST_API_URL)
    .post("/v3/market/place-ask/test")
    .reply(200, bitkubTestPlaceBidResponse);
  nock(TEST_API_URL)
    .post("/v3/market/cancel-order")
    .reply(200, bitkubCancelOrderResponse);
};
