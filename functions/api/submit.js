import { EmailMessage } from "cloudflare:email";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hardcoded addresses
    const fromAddress = "form@lorikelley.dev";
    const toAddress = "lorideveloper@gmail.com"; // <-- PUT YOUR REAL GMAIL HERE

    const rawEmail = [
      `From: ${name} <${fromAddress}>`,
      `To: ${toAddress}`,
      `Reply-To: ${email}`,
      `Subject: New Website Submission from ${name}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      ``,
      `Message:`,
      `${message}`
    ].join("\r\n");

    const emailMessage = new EmailMessage(
      fromAddress,
      toAddress,
      rawEmail
    );

    // Uses the Email Routing binding
    await env.SEB.send(emailMessage);

    return new Response(
      JSON.stringify({ message: "Sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
