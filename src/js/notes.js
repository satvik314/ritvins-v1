// The line a guest reads on the thank-you card after replying.
//
// reply: { name, haldi, sangeeth, wedding, party, attending }
//   haldi, sangeeth, wedding are "yes" or "no"
//   attending is true when at least one of them is "yes"
//
// TODO(Satvik): make this personal. See the note in the handover message.
window.noteFor = function (reply) {
  return reply.attending
    ? "We can't wait to celebrate with you."
    : "We'll miss you, and we'll send photos.";
};
