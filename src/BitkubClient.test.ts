import nock from "nock";
import BitkubClient from "./BitkubClient";
import bitkubPlaceBidResponse from "./__mocks__/bitkubBuyResponse.json";
import bitkubPlaceAskResponse from "./__mocks__/bitkubSellResponse.json";
import {
  BalancesResponse,
  BitkubEnvironment,
  BitkubErrorCode,
  BitkubOrderType,
  SymbolResponse,
} from "./models";

let client: BitkubClient;

const itif = process.env?.IS_FULL_TESTING === "true" ? it : it.skip;

beforeEach(() => {
  client = new BitkubClient(
    process.env.BITKUB_API_KEY || "",
    process.env.BITKUB_API_SECRET || ""
  );
});

afterEach(() => {
  nock.cleanAll();
});

describe("Bitkub client", () => {
  it("Get server time", async () => {
    const currentServerTime = await client.getServerTime();
    expect(currentServerTime.data).not.toBeNull();
  });

  it("Build a request payload including signature key", async () => {
    const payload = { id: "1234" };
    const result = await client.buildPayload(payload);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("sig");
    expect(result).toHaveProperty("ts");
  });

  it("Get symbols", async () => {
    const result = await client.getSymbols();
    const content: SymbolResponse = result.data;

    console.log("Bitkub All Symbols:", content);
    expect(content).toHaveProperty("error", BitkubErrorCode.NO_ERROR);
    expect(content).toHaveProperty("result");
  });

  itif("Get balances", async () => {
    const result = await client.getBalances();
    const content: BalancesResponse = result.data;
    expect(content).toHaveProperty("error", BitkubErrorCode.NO_ERROR);
    expect(content).toHaveProperty("result.THB.available");
    expect(content).toHaveProperty("result.THB.reserved");
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
    client = new BitkubClient("", "", BitkubEnvironment.PRODUCTION);
    client.setBaseApiUrl("http://localhost:9876");

    nock("http://localhost:9876").get("/servertime").reply(200, "1529999999");

    nock("http://localhost:9876")
      .post("/market/v2/place-bid")
      .reply(200, bitkubPlaceBidResponse);

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

  it("Close position through mocked server", async () => {
    client = new BitkubClient("", "", BitkubEnvironment.PRODUCTION);
    client.setBaseApiUrl("http://localhost:9876");

    nock("http://localhost:9876").get("/servertime").reply(200, "1529999999");

    nock("http://localhost:9876")
      .post("/market/v2/place-ask")
      .reply(200, bitkubPlaceAskResponse);

    const response = await client.placeAsk(
      "THB_KUB",
      0.1,
      0,
      BitkubOrderType.MARKET
    );

    const placeAskResult = response.data.result;

    expect(placeAskResult).toMatchSnapshot();
  });

  it("Open position in sandbox environment with mocked APIs", async () => {
    client = new BitkubClient("", "", BitkubEnvironment.TEST);
    client.setBaseApiUrl("http://localhost:9876");

    nock("http://localhost:9876").get("/servertime").reply(200, "1529999999");

    nock("http://localhost:9876")
      .post("/market/place-bid/test")
      .reply(200, bitkubPlaceBidResponse);

    const response = await client.placeBid(
      "THB_BTC",
      100,
      0,
      BitkubOrderType.MARKET
    );
    expect(response.data).toHaveProperty("error", BitkubErrorCode.NO_ERROR);

    const placeBidResultest = response.data.result;

    expect(placeBidResultest).toMatchSnapshot();
  });

  it("Close position in sandbox environment with mocked APIs", async () => {
    client = new BitkubClient("", "", BitkubEnvironment.TEST);
    client.setBaseApiUrl("http://localhost:9876");

    nock("http://localhost:9876").get("/servertime").reply(200, "1529999999");

    nock("http://localhost:9876")
      .post("/market/place-ask/test")
      .reply(200, bitkubPlaceBidResponse);

    const response = await client.placeAsk(
      "THB_KUB",
      0.1,
      0,
      BitkubOrderType.MARKET
    );
    const { error } = response.data;
    const isCheckingBody = error === BitkubErrorCode.NO_ERROR;
    const isEmptyWallet = error === BitkubErrorCode.EMPTY_WALLET;
    const isLowAmount = error === BitkubErrorCode.AMOUNT_TOO_LOW;
    expect(isCheckingBody || isEmptyWallet || isLowAmount).toBeTruthy();

    if (isEmptyWallet)
      console.log("Cannot create a sell order due to empty wallet.");

    if (!isCheckingBody) {
      console.log("No response from server");
      return;
    }

    const placeAskResult = response.data.result;

    expect(placeAskResult).toMatchSnapshot();
  });
});
