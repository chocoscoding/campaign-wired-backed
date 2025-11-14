import { Vonage } from '@vonage/server-sdk';
import { NCCOBuilder, Talk } from '@vonage/voice';

let vonageClient: any | null = null;

function initClient() {
  if (vonageClient) return vonageClient;

  const applicationId = process.env.VONAGE_APPLICATION_ID;
  const privateKey = process.env.VONAGE_PRIVATE_KEY;

  if (!applicationId || !privateKey) {
    throw new Error('Missing Vonage credentials: set VONAGE_APPLICATION_ID and VONAGE_PRIVATE_KEY (or VONAGE_PRIVATE_KEY_PATH)');
  }

  vonageClient = new Vonage({
    applicationId,
    privateKey,
  });

  return vonageClient;
}

async function createOutboundCall({ to, from, text }: { to: string; from: string; text: string; }) {
  const client = initClient();

  const builder = new NCCOBuilder();
  builder.addAction(new Talk(text));

  const payload = {
    ncco: builder.build(),
    to: [{ type: 'phone', number: to }],
    from: { type: 'phone', number: from },
  };

  // The SDK returns a Promise
  return client.voice.createOutboundCall(payload);
}

export default { createOutboundCall };
