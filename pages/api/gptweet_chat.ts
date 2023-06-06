import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Extract chat request data from the client request
    const { prompt, apiKey } = req.body;

    // Replace this URL with the URL of your Python backend chat API
    const pythonBackendURL = `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/chat`;
    console.log('backend endpoint',pythonBackendURL)
    // Send the chat request to your Python backend
    const response = await fetch(pythonBackendURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers for your Python backend
      },
      body: JSON.stringify({ prompt, apiKey }),
    });

    // Forward the response from your Python backend to the client
    const result = await response.json();
    res.status(response.status).json(result);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
