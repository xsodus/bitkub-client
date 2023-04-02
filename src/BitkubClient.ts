import axios, { Axios } from "axios";
import crypto from "crypto";
import querystring from "querystring";
import {
  BITKUB_API_KEY_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
  SECURE_API_URL,
} from "./constants";
import {
  AskResponse,
  BalancesResponse,
  BidResponse,
  BitkubEnvironment,
  BitkubHeaderType,
  BitkubOrderType,
  PlaceAskResponse,
  PlaceBidResponse,
  SymbolResponse,
} from "./models";

export default class BitkubClient {
  apiKey: string;
  apiSecret: string;
  environment: BitkubEnvironment;
  axiosInstance: Axios;
  requestHeaders: BitkubHeaderType;

  constructor(
    apiKey: string,
    apiSecret: string,
    environment: BitkubEnvironment = BitkubEnvironment.TEST
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.requestHeaders = {
      [BITKUB_API_KEY_HEADER_NAME]: apiKey,
      accept: "application/json",
      [CONTENT_TYPE_HEADER_NAME]: "application/json",
    };
    this.environment = environment;
    this.axiosInstance = axios.create({
      headers: this.requestHeaders,
      timeout: 10000,
      baseURL: SECURE_API_URL,
    });
  }

  /**
   * Change the base url in axios configuration
   * @param url
   */
  setBaseApiUrl(url: string) {
    this.axiosInstance = axios.create({
      headers: this.requestHeaders,
      timeout: 10000,
      baseURL: url,
    });
  }

  /**
   * Get server time
   *
   * @returns {string} Bitkub server time
   */
  async getServerTime() {
    return this.axiosInstance.get<string>("/servertime");
  }

  /**
   * Build a request payload for Bitkub APIs.
   *
   * @param {object} request payload for each API.
   * @returns A request payload including ts and sig field which are required for any POST APIs.
   */
  async buildPayload(params = {}) {
    let payload: Record<string, any> = {
      ...params,
      ts: (await this.getServerTime()).data,
    };
    payload["sig"] = this.generateSignature(payload);
    return payload;
  }

  /**
   * Get market symbols
   *
   * @returns A list of symbols in Bitkub market.
   */
  async getSymbols() {
    return this.axiosInstance.get<SymbolResponse>(`/market/symbols`);
  }

  /**
   * Get current balances
   *
   * @returns A list of current balances
   */
  async getBalances() {
    return this.axiosInstance.post<BalancesResponse>(
      `/market/balances`,
      await this.buildPayload()
    );
  }

  /**
   * Get bid list from Bitkub
   *
   * @param symbol - Trading Symbol (BNB_THB, BTC_THB)
   * @param limit - Response Limit Size
   * @returns A list of bid
   */
  async getBids(symbol: string, limit = 1) {
    const params = {
      sym: symbol,
      lmt: limit,
    };
    const queryParams = querystring.stringify(await this.buildPayload(params));
    return this.axiosInstance.get<BidResponse>(`/market/bids?${queryParams}`);
  }

  /**
   * Get ask list from Bitkub
   *
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param limit - Response Limit Size
   * @returns A list of ask
   */
  async getAsks(symbol: string, limit = 1) {
    const params = {
      sym: symbol,
      lmt: limit,
    };
    const queryParams = querystring.stringify(await this.buildPayload(params));
    return this.axiosInstance.get<AskResponse>(`/market/asks?${queryParams}`);
  }

  generateSignature(payload: Record<string, any>) {
    const json = JSON.stringify(payload);
    const hash = crypto
      .createHmac("sha256", this.apiSecret)
      .update(json)
      .digest("hex");
    return hash;
  }

  /**
   * Place bid
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param amount - Buy amount
   * @param rate - Price rate
   * @param orderType - Order type (LIMIT, MARKET)
   * @returns Result of placing bid
   */
  async placeBid(
    symbol: string,
    amount: number,
    rate: number,
    orderType: BitkubOrderType = BitkubOrderType.MARKET,
    clientId = undefined
  ) {
    const params: Record<string, any> = {
      sym: symbol,
      amt: amount,
      rat: rate,
      typ: orderType,
    };
    if (clientId) params["client_id"] = clientId;

    const placeBidApiUrl =
      this.environment === BitkubEnvironment.TEST
        ? "/market/place-bid/test"
        : "/market/v2/place-bid";

    return this.axiosInstance.post<PlaceBidResponse>(
      placeBidApiUrl,
      await this.buildPayload(params)
    );
  }

  /**
   * Place ask
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param amount - Sell amount
   * @param rate - Price rate
   * @param orderType - Order type (LIMIT, MARKET)
   * @returns Result of placing ask
   */
  async placeAsk(
    symbol: string,
    amount: number,
    rate: number,
    orderType: BitkubOrderType = BitkubOrderType.MARKET,
    clientId = undefined
  ) {
    const params: Record<string, any> = {
      sym: symbol,
      amt: amount,
      rat: rate,
      typ: orderType,
    };
    if (clientId) params["client_id"] = clientId;

    const placeAskApiUrl =
      this.environment === BitkubEnvironment.TEST
        ? "/market/place-ask/test"
        : "/market/v2/place-ask";

    return this.axiosInstance.post<PlaceAskResponse>(
      placeAskApiUrl,
      await this.buildPayload(params)
    );
  }
}
