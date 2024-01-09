const axios = require('axios');
// const fetch = require('node-fetch');

export interface Message {
  role: 'system' | 'user';
  content: string;
}

async function fetchGPT3Response(messages: Message[]): Promise<any> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };
  const data = {
    model: 'gpt-4',
    // このmessagesに追加していく？
    messages: messages,
  };
  try {
    const response = await axios.post(url, data, { headers: headers });
    return response.data;
  } catch (error) {
    console.log('__gpt3Service.ts__18__', url, data, error.message);
    throw error.message;
    return '';
  }
}

export default fetchGPT3Response;
