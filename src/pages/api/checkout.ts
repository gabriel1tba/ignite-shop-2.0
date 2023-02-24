import { NextApiRequest, NextApiResponse } from 'next';

import { stripe } from 'lib/stripe';

type OrderList = {
	priceId: string;
	quantity: number;
};

interface ExtendedNextApiRequest extends NextApiRequest {
	body: {
		orderList: OrderList[];
	};
}

export default async function handler(
	req: ExtendedNextApiRequest,
	res: NextApiResponse
) {
	const { orderList } = req.body;

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed.' });
	}

	if (!orderList.length) {
		return res.status(400).json({ error: 'Price not found.' });
	}

	const successUrl = `${process.env.NEXT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
	const cancelUrl = `${process.env.NEXT_URL}/`;

	const checkoutSession = await stripe.checkout.sessions.create({
		success_url: successUrl,
		cancel_url: cancelUrl,
		mode: 'payment',
		line_items: orderList,
	});

	return res.status(201).json({
		checkoutUrl: checkoutSession.url,
	});
}
