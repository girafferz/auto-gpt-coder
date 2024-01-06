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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    };
    const data = {
        model: 'gpt-3.5-turbo',
        // このmessagesに追加していく？
        messages: messages,
        // messages: [
        //     {
        //         role: 'system',
        //         content: 'You are a code patch generator, I will send you a code diff and standard logs and error logs. please reply by patch file for fix the error.'
        //     },
        //     {
        //         role: 'user',
        //         content: prompt,
        //     },
        // ],
    };
    try {
        console.log("__gpt3Service.ts__24__", data);
        const response = await axios.post(url, data, { headers: headers });
        console.log("__gpt3Service.ts__17__", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.log("__gpt3Service.ts__18__", error.message)
        return '';
    }
}

export default fetchGPT3Response;