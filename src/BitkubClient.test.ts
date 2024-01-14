import nock from "nock";
import BitkubClient from "./BitkubClient";
import { TEST_API_URL } from "./__mocks__/apis/bitkub/constants";
import { createApi as createMarketApi } from "./__mocks__/apis/bitkub/marketApi";
import { createApi as createServerTimeApi } from "./__mocks__/apis/bitkub/serverTimeApi";
import {
  BITKUB_API_KEY_HEADER_NAME,
  BITKUB_SIGNATURE_HEADER_NAME,
  BITKUB_TIMESTAMP_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
} from "./constants";
import {
  BitkubEnvironment,
  BitkubErrorCode,
  BitkubHeaderType,
  BitkubOrderType,
  OrderSide,
  SymbolResponse,
} from "./models";

let client: BitkubClient;

jest.setTimeout(60000);

describe("Bitkub client", () => {
  beforeEach(() => {
    client = new BitkubClient(
      process.env.BITKUB_API_KEY || "test-key",
      process.env.BITKUB_API_SECRET || "test-secret",
      BitkubEnvironment.PRODUCTION
    );

    // Server Time API
    createServerTimeApi();

    // Market API
    createMarketApi();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("Get server time", async () => {
    const currentServerTime = await client.getServerTime();
    expect(currentServerTime.data).not.toBeNull();
  });

  it("Can change the api key", async () => {
    const newApiKey = "new-api-key";

    client.apiKey = newApiKey;

    expect(client.apiKey).toMatchSnapshot();
  });

  it("Can generate request header for GET method", async () =>{
    client.baseApiUrl = TEST_API_URL;

    const requestHeaders = await client.buildRequestHeaders('GET','/v3/hello?message=true', { test: "111" });

    expect(requestHeaders).toMatchSnapshot();
  })

  it("Can change the api secret", async () => {
    client.baseApiUrl = TEST_API_URL;
    const oldRequestHeaders = await client.buildRequestHeaders('POST','/v3/hello', { test: "111" });

    client.apiSecret = "XXXXXXXXXXXXXX";

    const newRequestHeaders = await client.buildRequestHeaders('POST','/v3/hello',{ test: "111" });

    expect(oldRequestHeaders).not.toEqual(newRequestHeaders);
  });

  it("Build a request payload including signature key", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;
    const payload = { id: "1234" };
    const result = await client.buildRequestHeaders('POST','/v3/hello',payload);
    expect(result).toMatchSnapshot();
  });

  it("Get symbols", async () => {
    const result = await client.getSymbols();
    const content: SymbolResponse = result.data;

    console.log("Bitkub All Symbols:", content);
    expect(content).toMatchSnapshot();
  });

  it("Get balances", async () => {
    client.baseApiUrl = TEST_API_URL;

    const result = await client.getBalances();
    const content = result.data;
    expect(content).toMatchSnapshot();
  });

  it("Get bids", async () => {
    const response = await client.getBids("THB_BTC");
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const [orderId, timestamp, volume, rate, amount] = response.data.result[0];

    expect(orderId).not.toBeUndefined();
    expect(timestamp).not.toBeUndefined();
    expect(volume).not.toBeUndefined();
    expect(rate).not.toBeUndefined();
    expect(amount).not.toBeUndefined();
  });

  it("Get asks", async () => {
    const response = await client.getAsks("THB_BTC");
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const [orderId, timestamp, volume, rate, amount] = response.data.result[0];

    expect(orderId).not.toBeUndefined();
    expect(timestamp).not.toBeUndefined();
    expect(volume).not.toBeUndefined();
    expect(rate).not.toBeUndefined();
    expect(amount).not.toBeUndefined();
  });

  it("Open position through mocked server", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;

    const response = await client.placeBid(
      "THB_DOGE",
      100,
      0,
      BitkubOrderType.MARKET,
      "test-client-id"
    );
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const placeBidResult = response.data.result;

    expect(placeBidResult).toMatchSnapshot();
  });

  it("Close position through mocked server", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;

    const response = await client.placeAsk(
      "THB_DOGE",
      0.1,
      0,
      BitkubOrderType.MARKET,
      "test-client-id"
    );

    const placeAskResult = response.data.result;

    expect(placeAskResult).toMatchSnapshot();
  });

  it("Open position in sandbox environment with mocked APIs", async () => {
    client = new BitkubClient("", "", BitkubEnvironment.TEST);
    client.baseApiUrl = TEST_API_URL;

    const response = await client.placeBid(
      "THB_BTC",
      100,
      0,
      BitkubOrderType.MARKET
    );
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const placeBidResult = response.data.result;

    expect(placeBidResult).toMatchSnapshot();
  });

  it("Close position in sandbox environment with mocked APIs", async () => {
    client = new BitkubClient("", "", BitkubEnvironment.TEST);
    client.baseApiUrl = TEST_API_URL;

    const response = await client.placeAsk(
      "THB_KUB",
      0.1,
      0,
      BitkubOrderType.MARKET
    );

    const placeAskResult = response.data.result;

    expect(placeAskResult).toMatchSnapshot();
  });

  it("Place a bid with default order type", async () => {
    client = new BitkubClient("", "", BitkubEnvironment.TEST);
    client.baseApiUrl = TEST_API_URL;

    const response = await client.placeBid("THB_BTC", 100, 0);

    const placeBidResult = response.data.result;

    expect(placeBidResult).toMatchSnapshot();
  });

  it("Ask a bid with default order type", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;

    const response = await client.placeAsk("THB_DOGE", 0.1, 0);

    const placeAskResult = response.data.result;

    expect(placeAskResult).toMatchSnapshot();
  });

  it("Should cancel an order with hash", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;

    createServerTimeApi();

    const buyOrderResponse = await client.placeBid(
      "THB_BTC",
      100,
      100000,
      BitkubOrderType.LIMIT
    );

    const { hash } = buyOrderResponse.data.result;

    const response = await client.cancelOrder(hash);

    const cancelOrderResult = response.data.error;

    expect(cancelOrderResult).toBe(0);
  });

  it("Should cancel an order with order id", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;

    createServerTimeApi();

    const buyOrderResponse = await client.placeBid(
      "THB_BTC",
      100,
      100000,
      BitkubOrderType.LIMIT
    );

    const { id } = buyOrderResponse.data.result;

    const response = await client.cancelOrder(
      null,
      "THB_BTC",
      id,
      OrderSide.BUY
    );

    const cancelOrderResult = response.data.error;

    expect(cancelOrderResult).toBe(0);
  });

  it("Can change the request timeout", async () => {
    client.setEnvironment(BitkubEnvironment.PRODUCTION);
    client.baseApiUrl = TEST_API_URL;

    client.requestTimeout = 1;

    createServerTimeApi();

    await expect(client.getServerTime()).rejects.toThrowError(
      "timeout of 1ms exceeded"
    );
  });
});
