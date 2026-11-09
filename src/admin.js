// The couple's replies page. Replies can only be read through the
// admin_replies function in Supabase, which checks the username and password
// itself (see supabase/admin.sql). Nothing secret lives in this file.
import "./js/config.js";

const { url, anonKey } = window.SITE.rsvp;
const $ = (id) => document.getElementById(id);
const KEY = "admin-login";

let replies = [];

async function fetchReplies(username, password) {
  const headers = { apikey: anonKey, "Content-Type": "application/json" };
  if (anonKey.startsWith("eyJ")) headers.Authorization = `Bearer ${anonKey}`;
  const response = await fetch(`${url}/rest/v1/rpc/admin_replies`, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_username: username, p_password: password }),
  });
  if (response.ok) return response.json();
  const problem = await response.json().catch(() => ({}));
  const error = new Error(problem.message || `Request failed (${response.status})`);
  error.wrongLogin = problem.code === "28P01";
  throw error;
}

/* ---------- Signing in ---------- */

function saved() {
  try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; }
}

async function signIn(username, password, quiet) {
  const button = $("signIn");
  button.disabled = true;
  button.textContent = "Signing in";
  $("loginErr").hidden = true;
  try {
    replies = await fetchReplies(username, password);
    try { sessionStorage.setItem(KEY, JSON.stringify({ username, password })); } catch (e) {}
    $("loginView").hidden = true;
    $("dashView").hidden = false;
    render();
  } catch (error) {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    if (!quiet) {
      $("loginErr").textContent = error.wrongLogin
        ? "That username or password isn't right."
        : "Couldn't reach the replies. Check your connection and try again.";
      $("loginErr").hidden = false;
    }
  } finally {
    button.disabled = false;
    button.textContent = "Sign in";
  }
}

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  signIn($("user").value.trim(), $("pass").value);
});

$("signOut").addEventListener("click", () => {
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  replies = [];
  $("pass").value = "";
  $("dashView").hidden = true;
  $("loginView").hidden = false;
});

$("refresh").addEventListener("click", async () => {
  const login = saved();
  if (!login) return;
  $("refresh").disabled = true;
  try { replies = await fetchReplies(login.username, login.password); render(); }
  catch (error) { alert("Couldn't refresh. Check your connection and try again."); }
  finally { $("refresh").disabled = false; }
});

/* ---------- The list ---------- */

const nameKey = (r) => r.name.trim().toLowerCase();

// Replies arrive newest first, so the first one seen for a name is current.
function latestOnly(list) {
  const seen = new Set();
  return list.filter((r) => {
    const k = nameKey(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const when = (iso) => new Date(iso).toLocaleString(undefined, {
  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});

function render() {
  const current = latestOnly(replies);
  const currentIds = new Set(current.map((r) => r.id));
  const guests = (event) => current.filter((r) => r[event]).reduce((n, r) => n + r.party, 0);

  $("sReplies").textContent = current.length;
  $("sHaldi").textContent = guests("haldi");
  $("sSangeeth").textContent = guests("sangeeth");
  $("sWedding").textContent = guests("wedding");
  $("sDeclined").textContent = current.filter((r) => !r.haldi && !r.sangeeth && !r.wedding).length;
  $("updated").textContent = `Updated ${new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;

  const query = $("search").value.trim().toLowerCase();
  const filter = $("filter").value;
  const list = ($("showAll").checked ? replies : current).filter((r) => {
    if (filter === "none" && (r.haldi || r.sangeeth || r.wedding)) return false;
    if (filter !== "all" && filter !== "none" && !r[filter]) return false;
    if (!query) return true;
    return [r.name, r.contact, r.note].some((v) => (v || "").toLowerCase().includes(query));
  });

  const body = $("rows");
  body.replaceChildren();
  list.forEach((r) => {
    const tr = document.createElement("tr");
    if (!currentIds.has(r.id)) tr.className = "old";
    const cells = [
      [r.name, "Name"],
      [String(r.party), "Party"],
      [r.haldi ? "Yes" : "No", "Haldi"],
      [r.sangeeth ? "Yes" : "No", "Sangeeth"],
      [r.wedding ? "Yes" : "No", "Wedding"],
      [r.contact || "", "Contact"],
      [r.note || "", "Note"],
      [when(r.created_at) + (currentIds.has(r.id) ? "" : " (earlier reply)"), "Replied"],
    ];
    cells.forEach(([text, label], i) => {
      const td = document.createElement("td");
      td.dataset.label = label;
      td.textContent = text;
      if (i >= 2 && i <= 4) td.className = text === "Yes" ? "yes" : "no";
      tr.append(td);
    });
    body.append(tr);
  });
  $("empty").hidden = list.length > 0;
  $("empty").textContent = replies.length ? "No replies match." : "No replies yet.";
}

["search", "filter", "showAll"].forEach((id) => $(id).addEventListener("input", render));

/* ---------- CSV ---------- */

$("csv").addEventListener("click", () => {
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Name", "Party", "Haldi", "Sangeeth", "Wedding", "Contact", "Note", "Replied at", "Latest reply"];
  const currentIds = new Set(latestOnly(replies).map((r) => r.id));
  const lines = replies.map((r) => [
    r.name, r.party, r.haldi ? "Yes" : "No", r.sangeeth ? "Yes" : "No", r.wedding ? "Yes" : "No",
    r.contact, r.note, r.created_at, currentIds.has(r.id) ? "Yes" : "No",
  ].map(cell).join(","));
  const blob = new Blob(["﻿" + [head.map(cell).join(","), ...lines].join("\r\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `replies-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

/* ---------- Start: reuse this tab's sign-in if there is one ---------- */

const login = saved();
if (login) {
  $("user").value = login.username;
  signIn(login.username, login.password, true);
}
