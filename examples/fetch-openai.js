const fetch = require('node-fetch');

async function run() {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true,
      response_format: { type: 'json_object' },
    }),
  });

  for await (const chunk of res.body) {
    console.log(chunk.toString());
  }
}

run().catch(console.error);
