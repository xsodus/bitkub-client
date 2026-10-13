import {
  BITKUB_API_KEY_HEADER_NAME,
  BITKUB_SIGNATURE_HEADER_NAME,
  BITKUB_TIMESTAMP_HEADER_NAME,
  CONTENT_TYPE_HEADER_NAME,
} from "./constants";

// Ref: https://github.com/bitkub/bitkub-official-api-docs/blob/master/restful-api.md#error-codes
export enum BitkubErrorCode {
  NO_ERROR = 0,
  INVALID_JSON_PAYLOAD = 1,
  MISSING_X_BTK_APIKEY = 2,
  INVALID_API_KEY = 3,
  API_PENDING_FOR_ACTIVATION = 4,
  IP_NOT_ALLOWED = 5,
  MISSING_OR_INVALID_SIGNATURE = 6,
  MISSING_TIMESTAMP = 7,
  INVALID_TIMESTAMP = 8,
  INVALID_USER = 9,
  INVALID_PARAMETER = 10,
  INVALID_SYMBOL = 11,
  INVALID_AMOUNT = 12,
  INVALID_RATE = 13,
  IMPROPER_RATE = 14,
  AMOUNT_TOO_LOW = 15,
  FAILED_TO_GET_BALANCE = 16,
  EMPTY_WALLET = 17,
  INSUFFICIENT_BALANCE = 18,
  FAILED_TO_INSERT_ORDER_INTO_DB = 19,
  FAILED_TO_DEDUCT_BALANCE = 20,
  INVALID_ORDER_FOR_CANCELLATION = 21,
  INVALID_SIDE = 22,
  FAILED_TO_UPDATE_ORDER_STATUS = 23,
  INVALID_ORDER_FOR_LOOKUP = 24,
  KEY_LEVEL_1_REQUIRED = 25,
  LIMIT_EXCEEDS = 30,
  PENDING_WITHDRAWAL_EXISTS = 40,
  INVALID_CURRENCY_FOR_WITHDRAWAL = 41,
  ADDRESS_IS_NOT_IN_WHITELIST = 42,
  FAILED_TO_DEDUCT_CRYPTO = 43,
  FAILED_TO_CREATE_WITHDRAWAL_RECORD = 44,
  NONCE_HAS_TO_BE_NUMERIC = 45,
  INVALID_NOUNCE = 46,
  WITHDRAWAL_LIMIT_EXCEEDS = 47,
  INVALID_BANK_ACCOUNT = 48,
  BANK_LIMIT_EXCEEDS = 49,
  WITHDRAWAL_IS_UNDER_MAINTENANCE = 51,
  INVALID_PERMISSION = 52,
  INVALID_INTERNAL_ADDRESS = 53,
  ADDRESS_HAS_BEEN_DEPRECATED = 54,
  CANCEL_ONLY_MODE = 55,
  USER_HAS_BEEN_SUSPENDED_FROM_PURCHASING = 56,
  USER_HAS_BEEN_SUSPENDED_FROM_SELLING = 57,
  SERVER_ERROR = 90,
}

export type BitkubHeaderType = {
  [BITKUB_API_KEY_HEADER_NAME]: string;
  accept: string;
  [CONTENT_TYPE_HEADER_NAME]: string;
  [BITKUB_SIGNATURE_HEADER_NAME]? : string;
  [BITKUB_TIMESTAMP_HEADER_NAME]? : number;
};

export type BitkubSymbolInfo = {
  id: number;
  info: string;
  symbol: string;
};

export interface SymbolResponse {
  error?: BitkubErrorCode;
  result: Array<BitkubSymbolInfo | MarketSymbolInfo>;
}

export interface MarketSymbolInfo {
  base_asset: string;
  base_asset_scale: number;
  buy_price_gap_as_percent: number;
  created_at: string;
  description: string;
  freeze_buy: boolean;
  freeze_cancel: boolean;
  freeze_sell: boolean;
  market_segment: string;
  min_quote_size: number;
  modified_at: string;
  name: string;
  pairing_id: number;
  price_scale: number;
  price_step: string;
  quantity_scale: number;
  quantity_step: string;
  quote_asset: string;
  quote_asset_scale: number;
  sell_price_gap_as_percent: number;
  status: string;
  symbol: string;
  source: string;
}

export interface BitkubV4Response<T> {
  code: string | number;
  message: string;
  data: T;
  pagination?: { page: number; limit: number };
}

export interface WalletBalance {
  currency: string;
  available: string;
  reserved: string;
  total: string;
}

export interface WalletQueryParams {
  segment?: "funding";
}

export type BalancesResponse = BitkubV4Response<WalletBalance[]>;
export type WalletAssetsResponse = BitkubV4Response<Record<string, string>>;

export interface MarketOrder {
  order_id: string;
  price: string;
  side: "buy" | "sell";
  size: string;
  timestamp: number;
  volume: string;
}

export enum BitkubOrderType {
  LIMIT = "limit",
  MARKET = "market",
}

export enum BitkubEnvironment {
  TEST = "test",
  PRODUCTION = "production",
}

export interface PlaceBidResponse {
  error: BitkubErrorCode;
  result: Result;
}

export interface Result {
  id: string;
  hash: string;
  typ: string;
  amt: number;
  rat: number;
  fee: number;
  cre: number;
  rec: number;
  ts: number;
  ci: string;
}

export interface PlaceAskResponse {
  error: BitkubErrorCode;
  result: Result;
}

export interface AskResponse {
  error: BitkubErrorCode;
  result: MarketOrder[];
}

export interface BidResponse {
  error: BitkubErrorCode;
  result: MarketOrder[];
}

export interface OrderRequest {
  sym?: string;
  id?: string;
  sd?: OrderSide;
  hash: string;
}

export interface CancelResponse {
  error: number;
}

export enum OrderSide {
  BUY = "buy",
  SELL = "sell",
}
