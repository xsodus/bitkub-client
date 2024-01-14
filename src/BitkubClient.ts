import axios, { Axios, AxiosInstance, AxiosResponse } from "axios";
import crypto from "crypto";
import querystring from "querystring";
import {
  BITKUB_API_KEY_HEADER_NAME,
  BITKUB_SIGNATURE_HEADER_NAME,
  BITKUB_TIMESTAMP_HEADER_NAME,
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
import isEmpty from 'lodash/isEmpty'

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
   * @param secret
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
  async getServerTime(): Promise<AxiosResponse<number>> {
    return this._axiosInstance.get("/v3/servertime");
  }

  /**
   * Build request header based on Bitkub signature algorithm
   * Ref: https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md#payload-post
   *
   * @param {object} request payload for each API.
   * @returns A request payload including ts and sig field which are required for any POST APIs.
   */
  async buildRequestHeaders(method:'GET'|'POST', apiPath:string,payload?:Record<string,string|number|undefined>): Promise<BitkubHeaderType> {
    const timestamp = (await this.getServerTime()).data

    // Example for Post Method
    // 1699376552354POST/api/v3/market/place-bid{"sym":"thb_btc","amt": 1000,"rat": 10,"typ": "limit"}
    const token = `${timestamp}${method}/api${apiPath}${isEmpty(payload) ? '' : JSON.stringify(payload)}`
    const signature = this.generateSignature(token);

    return {
      ...this._requestHeaders,
      [BITKUB_SIGNATURE_HEADER_NAME]: signature,
      [BITKUB_TIMESTAMP_HEADER_NAME]: timestamp
    } as BitkubHeaderType;
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
      `/v3/market/balances`,
      undefined,
      {headers:await this.buildRequestHeaders('POST',`/v3/market/balances`)}
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
    const queryParams = querystring.stringify(params);
    const uri = `/market/bids?${queryParams}`
    return this._axiosInstance.get(uri, {headers: await this.buildRequestHeaders('GET',uri)});
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
    const queryParams = querystring.stringify(params);
    const uri = `/market/asks?${queryParams}`;
    return this._axiosInstance.get(uri,{headers:await this.buildRequestHeaders('GET',uri)});
  }

  generateSignature(token: string): string {
    const hash = crypto
      .createHmac("sha256", this._apiSecret)
      .update(token)
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
        ? "/v3/market/place-bid/test"
        : "/v3/market/place-bid";

    return this._axiosInstance.post(
      placeBidApiUrl,
      params,
      {headers:await this.buildRequestHeaders('POST',placeBidApiUrl,params)}
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
        ? "/v3/market/place-ask/test"
        : "/v3/market/place-ask";

    return this._axiosInstance.post(
      placeAskApiUrl,
      params,
      {headers:await this.buildRequestHeaders('POST',placeAskApiUrl,params)}
    );
  }

  /**
   * Cancel order
   * @param orderId : Order Id
   * @returns Result of cancelling order
   */
  async cancelOrder(
    hash: string | null,
    symbol: string | undefined = undefined,
    orderId: string | undefined = undefined,
    orderSide: OrderSide | undefined = undefined
  ): Promise<AxiosResponse<CancelResponse>> {
    const params = hash
      ? { hash }
      : {
          sym: symbol,
          id: orderId,
          sd: orderSide,
        };

    const uri = `/v3/market/cancel-order`;
    return this._axiosInstance.post(
      uri,
      params,
      {headers: await this.buildRequestHeaders('POST',uri,params)}
    );
  }
}
