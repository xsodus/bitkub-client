import nock from "nock";
import { TEST_API_URL } from "./constants";

import bitkubBalanceResponse from "./reponses/bitkubBalanceResponse.json";
import bitkubPlaceBidResponse from "./reponses/bitkubBuyResponse.json";
import bitkubCancelOrderResponse from "./reponses/bitkubCancelOrderResponse.json";
import bitkubPlaceAskResponse from "./reponses/bitkubSellResponse.json";
import bitkubTestPlaceBidResponse from "./reponses/bitkubTestBuyResponse.json";

export const createApi = () => {
  nock(TEST_API_URL)
    .post("/v3/market/place-ask")
    .reply(200, bitkubPlaceAskResponse);
  nock(TEST_API_URL).post("/v3/market/balances").reply(200, bitkubBalanceResponse);
  nock(TEST_API_URL)
    .post("/v3/market/place-bid")
    .reply(200, bitkubPlaceBidResponse);
  nock(TEST_API_URL)
    .post("/market/place-bid/test")
    .reply(200, bitkubTestPlaceBidResponse);
  nock(TEST_API_URL)
    .post("/market/place-ask/test")
    .reply(200, bitkubTestPlaceBidResponse);
  nock(TEST_API_URL)
    .post("/v3/market/cancel-order")
    .reply(200, bitkubCancelOrderResponse);
};
