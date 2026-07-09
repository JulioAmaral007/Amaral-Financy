import { assertNoError, unwrapList } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateAssetInput } from "@/schemas/investment.schema";
import type { InvestmentAsset } from "@/types/investment";

interface AssetRow {
  id: string;
  ticker: string;
  name: string;
  asset_class: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  "id, ticker, name, asset_class, quantity, avg_price, current_price, created_at, updated_at";

function mapRow(row: AssetRow): InvestmentAsset {
  return {
    id: row.id,
    ticker: row.ticker,
    name: row.name,
    assetClass: row.asset_class as InvestmentAsset["assetClass"],
    quantity: row.quantity,
    avgPrice: row.avg_price,
    currentPrice: row.current_price,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRowInput(input: CreateAssetInput) {
  return {
    ticker: input.ticker,
    name: input.name,
    asset_class: input.assetClass,
    quantity: input.quantity,
    avg_price: input.avgPrice,
    current_price: input.currentPrice,
  };
}

export async function listAssets(userId: string): Promise<InvestmentAsset[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("investment_assets")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("ticker", { ascending: true })
    .returns<AssetRow[]>();

  return unwrapList(result, "listAssets").map(mapRow);
}

export async function createAsset(userId: string, input: CreateAssetInput): Promise<InvestmentAsset> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("investment_assets")
    .insert({ user_id: userId, ...toRowInput(input) })
    .select(SELECT_COLUMNS)
    .single<AssetRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to create asset");
  return mapRow(data);
}

export async function updateAsset(
  userId: string,
  id: string,
  input: CreateAssetInput
): Promise<InvestmentAsset> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("investment_assets")
    .update(toRowInput(input))
    .eq("id", id)
    .eq("user_id", userId)
    .select(SELECT_COLUMNS)
    .single<AssetRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to update asset");
  return mapRow(data);
}

export async function deleteAsset(userId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("investment_assets").delete().eq("id", id).eq("user_id", userId);
  assertNoError(error, "deleteAsset");
}
