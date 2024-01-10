import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://api.coindesk.com', // Your base URL
});

export class Sample {
  constructor() {}

  async execute() {
    const response = await axiosInstance.get('/v1/bpi/currentprice/BTC.json');

    if (response.status !== 200) {
      throw new Error(`Error when getting BTC price: ${response.status}`);
    }

    // 価格の一週間を推移をlog表示
    return response.data.bpi.USD.rate_float; // The path might be different based on the API response
  }
}
