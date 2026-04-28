import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.includes("admin-ops-temp-key-2026")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { action, user_id, email, password } = await req.json();
  const results: any[] = [];

  try {
    if (action === "delete") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      results.push({ action: "delete", user_id, error: error?.message || null });
    } else if (action === "update") {
      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, updateData);
      results.push({ action: "update", user_id, error: error?.message || null });
    } else if (action === "wipe_all_users") {
      let page = 1;
      while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) { results.push({ error: error.message }); break; }
        if (!data.users.length) break;
        for (const u of data.users) {
          const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
          results.push({ deleted: u.email, error: delErr?.message || null });
        }
        if (data.users.length < 1000) break;
      }
    }
  } catch (e) {
    results.push({ error: e.message });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
