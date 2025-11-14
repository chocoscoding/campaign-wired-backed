import { Request, Response } from 'express';

export async function inboundMessage(req: Request, res: Response) {
  // Log the inbound message payload and return 200 as Vonage expects
  console.log('Inbound message webhook received:', JSON.stringify(req.body));
  // Respond with 200 OK quickly to avoid retry queues
  return res.status(200).json({ received: true });
}

export async function messageStatus(req: Request, res: Response) {
  // Log the message status event and return 200
  console.log('Message status webhook received:', JSON.stringify(req.body));
  return res.status(200).json({ received: true });
}
