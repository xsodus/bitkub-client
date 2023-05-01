import axios, { Axios, AxiosInstance, AxiosResponse } from "axios";
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
  CancelResponse,
  OrderSide,
  PlaceAskResponse,
  PlaceBidResponse,
  SymbolResponse,
} from "./models";

export default class BitkubClient {
  private _apiSecret: string;
  private _environment: BitkubEnvironment;
  private _axiosInstance: Axios;
  private _requestHeaders: BitkubHeaderType | null = null;
  private _requestTimeout: number;
  private _baseApiUrl: string;
  private _apiKey: string;

  /**
   * Create a new BitkubClient
   * @param apiKey - Your API Key
   * @param apiSecret - Your API Secret
   * @param environment - Environment to call API
   * @param baseApiUrl - Base API URL
   * @param requestTimeout - Request timeout in milliseconds
   */
  constructor(
    apiKey: string,
    apiSecret: string,
    environment: BitkubEnvironment = BitkubEnvironment.TEST,
    baseApiUrl: string = SECURE_API_URL,
    requestTimeout: number = 10000
  ) {
    this._apiKey = apiKey;
    this._baseApiUrl = baseApiUrl;
    this._apiSecret = apiSecret;
    this._environment = environment;
    this._requestTimeout = requestTimeout;
    this._requestHeaders = this.createAxiosHeader();
    this._axiosInstance = this.createAxiosInstance();
  }

  /**
   * Create axios headers
   */
  private createAxiosHeader(): BitkubHeaderType {
    return {
      [BITKUB_API_KEY_HEADER_NAME]: this._apiKey,
      accept: "application/json",
      [CONTENT_TYPE_HEADER_NAME]: "application/json",
    };
  }

  /**
   * Create an axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      headers: this._requestHeaders || {},
      timeout: this._requestTimeout,
      baseURL: this._baseApiUrl,
    });
  }

  /**
   * Change the base url in axios configuration
   * @param url
   */
  set baseApiUrl(url: string) {
    this._baseApiUrl = url;
    this._axiosInstance = this.createAxiosInstance();
  }

  /**
   * Change the request timeout in axios configuration
   * @param timeout
   */
  set requestTimeout(timeout: number) {
    this._requestTimeout = timeout;
    this._axiosInstance = this.createAxiosInstance();
  }

  /**
   * Change the api secret in axios configuration
   * @param value
   */
  set apiKey(key: string) {
    this._apiKey = key;
    this._requestHeaders = this.createAxiosHeader();
    this._axiosInstance = this.createAxiosInstance();
  }

  /**
   * Change the api secret
   */
  set apiSecret(secret: string) {
    this._apiSecret = secret;
  }

  /**
   * Change environment to call API
   * It will affect to call place-bid and place-ask api.
   * @param environment
   */
  setEnvironment(environment: BitkubEnvironment) {
    this._environment = environment;
  }

  /**
   * Get server time
   *
   * @returns {string} Bitkub server time
   */
  async getServerTime(): Promise<AxiosResponse<string>> {
    return this._axiosInstance.get("/servertime");
  }

  /**
   * Build a request payload for Bitkub APIs.
   *
   * @param {object} request payload for each API.
   * @returns A request payload including ts and sig field which are required for any POST APIs.
   */
  async buildPayload(params = {}): Promise<Record<string, any>> {
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
  async getSymbols(): Promise<AxiosResponse<SymbolResponse>> {
    return this._axiosInstance.get(`/market/symbols`);
  }

  /**
   * Get current balances
   *
   * @returns A list of current balances
   */
  async getBalances(): Promise<AxiosResponse<BalancesResponse>> {
    return this._axiosInstance.post(
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
  async getBids(
    symbol: string,
    limit = 1
  ): Promise<AxiosResponse<BidResponse>> {
    const params = {
      sym: symbol,
      lmt: limit,
    };
    const queryParams = querystring.stringify(await this.buildPayload(params));
    return this._axiosInstance.get(`/market/bids?${queryParams}`);
  }

  /**
   * Get ask list from Bitkub
   *
   * @param symbol - Trading Symbol (THB_BNB, THB_BTC)
   * @param limit - Response Limit Size
   * @returns A list of ask
   */
  async getAsks(
    symbol: string,
    limit = 1
  ): Promise<AxiosResponse<AskResponse>> {
    const params = {
      sym: symbol,
      lmt: limit,
    };
    const queryParams = querystring.stringify(await this.buildPayload(params));
    return this._axiosInstance.get(`/market/asks?${queryParams}`);
  }

  generateSignature(payload: Record<string, any>): string {
    const json = JSON.stringify(payload);
    const hash = crypto
      .createHmac("sha256", this._apiSecret)
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
    clientId: string | undefined = undefined
  ): Promise<AxiosResponse<PlaceBidResponse>> {
    const params: Record<string, any> = {
      sym: symbol,
      amt: amount,
      rat: rate,
      typ: orderType,
    };
    if (clientId) params["client_id"] = clientId;

    const placeBidApiUrl =
      this._environment === BitkubEnvironment.TEST
        ? "/market/place-bid/test"
        : "/market/v2/place-bid";

    return this._axiosInstance.post(
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
    clientId: string | undefined = undefined
  ): Promise<AxiosResponse<PlaceAskResponse>> {
    const params: Record<string, any> = {
      sym: symbol,
      amt: amount,
      rat: rate,
      typ: orderType,
    };
    if (clientId) params["client_id"] = clientId;

    const placeAskApiUrl =
      this._environment === BitkubEnvironment.TEST
        ? "/market/place-ask/test"
        : "/market/v2/place-ask";

    return this._axiosInstance.post(
      placeAskApiUrl,
      await this.buildPayload(params)
    );
  }

  /**
   * Cancel order
   * @param orderId : Order Id
   * @returns Result of cancelling order
   */
  async cancelOrder(
    hash: string,
    symbol: string | undefined = undefined,
    orderId: string | undefined = undefined,
    orderSide: OrderSide | undefined = undefined
  ): Promise<AxiosResponse<CancelResponse>> {
    const params = hash
      ? { hash }
      : {
          sym: symbol,
          id: orderId,
          orderSide: orderSide,
        };

    return this._axiosInstance.post(
      `/market/cancel-order`,
      await this.buildPayload(params)
    );
  }
}
