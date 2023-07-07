import { Chain } from 'wagmi'
 
export const localHost = {
  id: 31337,
  name: 'LocalHost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545/'] },
    default: { http: ['http://127.0.0.1:8545/'] },
  },
  

} as const satisfies Chain