import { Vonage } from '@vonage/server-sdk';
import { Channels } from '@vonage/messages';

function initClient() {
  const applicationId = process.env.VONAGE_APPLICATION_ID;
  const privateKey = process.env.VONAGE_PRIVATE_KEY;

  if (!applicationId || !privateKey) {
    throw new Error('Missing vonage messages credentials: VONAGE_APPLICATION_ID or VONAGE_PRIVATE_KEY');
  }

  const client = new Vonage({
    applicationId,
    privateKey,
  });

  return client;
}

async function sendSms({ to, from, text }: { to: string; from: string; text: string; }) {
  const client = initClient();

  return client.messages.send({
    messageType: 'text',
    channel: Channels.SMS,
    text,
    to,
    from,
  });
}

export default { sendSms };
