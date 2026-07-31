import { EmailMessage } from "cloudflare:email";
import createMimeMessage from "mimetext";

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

    // Build the email message
    const msg = createMimeMessage();
    
    // Sender MUST use your domain name so SPF/DKIM validation passes
    msg.setSender({ name: `${name} (Website Form)`, addr: "form@" + env.DOMAIN_NAME });
    
    // Recipient is your personal Gmail address
    msg.setRecipient(env.MY_GMAIL_ADDRESS);
    
    // Setting Reply-To ensures hitting 'Reply' in Gmail responds to the visitor
    msg.setHeader("Reply-To", email);
    
    msg.setSubject(`New Contact Form Submission from ${name}`);
    msg.setMessage("text/plain", `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`);

    // Create Cloudflare EmailMessage
    const emailMessage = new EmailMessage(
      "form@" + env.DOMAIN_NAME,
      env.MY_GMAIL_ADDRESS,
      msg.asRaw()
    );

    // Send via Cloudflare's native email binding
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
