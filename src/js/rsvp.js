// Saves a reply. The rest of the site only calls sendReply(), so the storage
// can change without touching the form.
window.sendReply = async function (reply) {
  const { url, anonKey } = window.SITE.rsvp;

  if (!url) {
    console.warn("Preview mode: this reply was kept in this browser only. Set SITE.rsvp to go live.", reply);
    return;
  }

  const response = await fetch(`${url}/rest/v1/rsvps`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: reply.name,
      haldi: reply.haldi === "yes",
      sangeeth: reply.sangeeth === "yes",
      wedding: reply.wedding === "yes",
      party: reply.party,
      contact: reply.contact,
      note: reply.note,
    }),
  });

  if (!response.ok) throw new Error(`RSVP save failed with status ${response.status}`);
};
