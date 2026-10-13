import nock from "nock";
import { TEST_API_URL } from "./constants";

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
  nock(TEST_API_URL).get("/v3/market/symbols").reply(200, bitkubSymbolsResponse);
  nock(TEST_API_URL)
    .get("/v3/market/bids")
    .query({ sym: "BTC_THB", lmt: "1" })
    .reply(200, { error: 0, result: [{ order_id: "mock-bid-id", price: "50000", side: "buy", size: "0.001", timestamp: 1699376552000, volume: "50" }] });
  nock(TEST_API_URL)
    .get("/v3/market/asks")
    .query({ sym: "BTC_THB", lmt: "1" })
    .reply(200, { error: 0, result: [{ order_id: "mock-ask-id", price: "50000", side: "sell", size: "0.001", timestamp: 1699376552000, volume: "50" }] });

  nock(TEST_API_URL)
    .post("/v3/market/place-ask")
    .reply(200, bitkubPlaceAskResponse);
  nock(TEST_API_URL)
    .get("/v4/wallet/balances")
    .reply(200, { code: "0", message: "success", data: [{ currency: "BTC", available: "0.00112343", reserved: "0", total: "0.00112343" }] });
  nock(TEST_API_URL)
    .get("/v4/wallet/assets")
    .reply(200, { code: "0", message: "success", data: { BTC: "0.00112343" } });
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
