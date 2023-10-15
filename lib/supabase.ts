export async function createSupabaseConnection() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

interface ChatMessage {
  user_id: string;
  sender: string;
  text: string;
}

export async function storeMessage(supabase: any, message: ChatMessage) {
  const { data, error } = await supabase.from("agri_users").insert(message);
  if (error) console.error(error);
  return data;
}

export async function getChatHistory(supabase: any, user_id: string) {
  const { data, error } = await supabase
    .from("agri_users")
    .select()
    .eq("user_id", user_id)
    .order("created_at", { ascending: true });

  if (error) console.error(error);
  return data;
}

export async function getStoryStart(supabase: any, user_id: string) {
  const { data, error } = await supabase
    .from("agri_chats")
    .select()
    .eq("user_id", user_id);
  if (error) console.error(error);
  return data;
}

export async function updateStoryStart(supabase: any, user_id: string) {
  const { data, error } = await supabase
    .from("agri_chats")
    .update({ firstmessagesent: true })
    .eq("user_id", user_id);
  if (error) console.error(error);
  return data;
}

export async function createStoryStart(supabase: any, user_id: string) {
  const { data, error } = await supabase
    .from("agri_chats")
    .insert([{ user_id, firstmessagesent: false }]);

  console.log(data);
  if (error) console.error(error);
  return data;
}

export async function reset(supabase: any, user_id: string) {
  const { data, error } = await supabase
    .from("agri_chats")
    .delete()
    .eq("user_id", user_id);

  if (error) console.error(error);

  const { error: error2 } = await supabase
    .from("agri_users")
    .delete()
    .eq("user_id", user_id);

  if (error) console.error(error2);
  return;
}
