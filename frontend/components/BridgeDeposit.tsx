'use client';

import '@/lib/lifi';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { getQuote, convertQuoteToRoute, executeRoute } from '@lifi/sdk';
import type { Route } from '@lifi/sdk';

const TARGET_CHAIN_ID = 8453; // Base mainnet
const TARGET_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';

interface Chain {
  id: number;
  name: string;
  symbol: string;
  icon: string;
}

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
}

const SOURCE_CHAINS: Chain[] = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: '⟠' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '⬡' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '◈' },
  { id: 10, name: 'Optimism', symbol: 'ETH', icon: '◉' },
  { id: 8453, name: 'Base', symbol: 'ETH', icon: '◎' },
  { id: 56, name: 'BNB Chain', symbol: 'BNB', icon: '◆' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', icon: '△' },
  { id: 250, name: 'Fantom', symbol: 'FTM', icon: '◇' },
];

const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  1: [
    { symbol: 'ETH', name: 'Ethereum', address: NATIVE_TOKEN, decimals: 18, icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, icon: '◎' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, icon: '◆' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, icon: '⟠' },
    { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, icon: '◈' },
    { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, icon: '◉' },
  ],
  137: [
    { symbol: 'POL', name: 'Polygon', address: NATIVE_TOKEN, decimals: 18, icon: '⬡' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, icon: '◎' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, icon: '⟠' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', decimals: 8, icon: '◆' },
  ],
  42161: [
    { symbol: 'ETH', name: 'Ethereum', address: NATIVE_TOKEN, decimals: 18, icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, icon: '◎' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8, icon: '◆' },
    { symbol: 'ARB', name: 'Arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, icon: '◈' },
  ],
  10: [
    { symbol: 'ETH', name: 'Ethereum', address: NATIVE_TOKEN, decimals: 18, icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, icon: '◎' },
    { symbol: 'OP', name: 'Optimism', address: '0x4200000000000000000000000000000000000042', decimals: 18, icon: '◉' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', decimals: 8, icon: '◆' },
  ],
  8453: [
    { symbol: 'ETH', name: 'Ethereum', address: NATIVE_TOKEN, decimals: 18, icon: '⟠' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, icon: '◎' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18, icon: '⟠' },
    { symbol: 'cbBTC', name: 'Coinbase BTC', address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', decimals: 8, icon: '◆' },
  ],
  56: [
    { symbol: 'BNB', name: 'BNB', address: NATIVE_TOKEN, decimals: 18, icon: '◆' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18, icon: '◎' },
    { symbol: 'BTCB', name: 'Bitcoin BEP2', address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', decimals: 18, icon: '◆' },
    { symbol: 'ETH', name: 'Ethereum', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', decimals: 18, icon: '⟠' },
  ],
  43114: [
    { symbol: 'AVAX', name: 'Avalanche', address: NATIVE_TOKEN, decimals: 18, icon: '△' },
    { symbol: 'USDC', name: 'USD Coin', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', decimals: 18, icon: '◎' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x50b7545627a5162F82A992c33b87aDc75187B218', decimals: 8, icon: '◆' },
  ],
  250: [
    { symbol: 'FTM', name: 'Fantom', address: NATIVE_TOKEN, decimals: 18, icon: '◇' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', decimals: 6, icon: '◎' },
    { symbol: 'USDT', name: 'Tether', address: '0x049d68029688eAbF473097a2fC38ef61633A3C7A', decimals: 6, icon: '◎' },
    { symbol: 'DAI', name: 'Dai', address: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', decimals: 18, icon: '◎' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x321162Cd933E2Be498Cd2267a90534A804051b11', decimals: 8, icon: '◆' },
  ],
};

type BridgeStatus = 'idle' | 'quoting' | 'quoted' | 'bridging' | 'done' | 'error';

export default function BridgeDeposit() {
  const { address } = useAccount();
  const [fromChainId, setFromChainId] = useState(1);
  const [fromToken, setFromToken] = useState<Token>(TOKENS_BY_CHAIN[1][0]);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof getQuote>> | null>(null);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [status, setStatus] = useState<BridgeStatus>('idle');
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [showChainMenu, setShowChainMenu] = useState(false);
  const [showTokenMenu, setShowTokenMenu] = useState(false);

  const selectedChain = SOURCE_CHAINS.find(c => c.id === fromChainId)!;
  const tokensForChain = TOKENS_BY_CHAIN[fromChainId] || [];

  const handleChainSelect = (chain: Chain) => {
    setFromChainId(chain.id);
    setFromToken(TOKENS_BY_CHAIN[chain.id][0]);
    setQuote(null);
    setStatus('idle');
    setShowChainMenu(false);
  };

  const handleTokenSelect = (token: Token) => {
    setFromToken(token);
    setQuote(null);
    setStatus('idle');
    setShowTokenMenu(false);
  };

  const handleGetQuote = async () => {
    if (!amount || !address) return;
    setStatus('quoting');
    setError('');
    setQuote(null);

    try {
      const fromAmount = BigInt(Math.floor(parseFloat(amount) * 10 ** fromToken.decimals)).toString();

      const q = await getQuote({
        fromChain: fromChainId,
        toChain: TARGET_CHAIN_ID,
        fromToken: fromToken.address,
        toToken: TARGET_USDC,
        fromAmount,
        fromAddress: address,
      });

      setQuote(q);
      setStatus('quoted');
    } catch (e) {
      const errorMessage = (e as Error).message || 'Failed to get quote';
      
      // Handle user-friendly error messages
      if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        setError('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('amount') || errorMessage.includes('Amount')) {
        setError('Invalid amount. Please enter a valid amount.');
      } else {
        // Show a simplified error message
        const shortError = errorMessage.length > 100 
          ? errorMessage.substring(0, 100) + '...' 
          : errorMessage;
        setError(shortError);
      }
      
      setStatus('error');
    }
  };

  const handleBridge = async () => {
    if (!quote) return;
    setStatus('bridging');
    setError('');

    try {
      const route = convertQuoteToRoute(quote);
      setActiveRoute(route);

      await executeRoute(route, {
        updateRouteHook(updatedRoute) {
          const lastStep = updatedRoute.steps[updatedRoute.steps.length - 1];
          const lastProcess = lastStep?.execution?.process?.slice(-1)[0];
          if (lastProcess?.status) {
            setStatusText(`${lastProcess.type}: ${lastProcess.status}`);
          }
          setActiveRoute({ ...updatedRoute });
        },
        acceptExchangeRateUpdateHook: async () => true,
      });

      setStatus('done');
      setStatusText('Bridge complete! USDC is now on Base.');
    } catch (e) {
      const errorMessage = (e as Error).message || 'Bridge failed';
      
      // Handle user-friendly error messages
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled. You rejected the transaction in your wallet.');
      } else if (errorMessage.includes('insufficient funds')) {
        setError('Insufficient funds. Check your balance and try again.');
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        // Show a simplified error message
        const shortError = errorMessage.length > 100 
          ? errorMessage.substring(0, 100) + '...' 
          : errorMessage;
        setError(shortError);
      }
      
      setStatus('error');
      setStatusText('');
    }
  };

  const formatUSDC = (amt: string) => (parseFloat(amt) / 1e6).toFixed(2);

  return (
    <div className="space-y-4">
      {/* From */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#52525b]">From</span>
          {/* Chain selector */}
          <div className="relative">
            <button
              onClick={() => { setShowChainMenu(!showChainMenu); setShowTokenMenu(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all text-sm"
            >
              <span>{selectedChain.icon}</span>
              <span className="text-[#e4e4e7]">{selectedChain.name}</span>
              <svg className="w-3 h-3 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showChainMenu && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-2xl bg-[#111111] border border-[rgba(255,255,255,0.08)] shadow-xl overflow-hidden">
                {SOURCE_CHAINS.map(chain => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSelect(chain)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-all ${
                      chain.id === fromChainId ? 'text-[#00d4aa]' : 'text-[#a1a1aa]'
                    }`}
                  >
                    <span className="text-base">{chain.icon}</span>
                    <span>{chain.name}</span>
                    {chain.id === fromChainId && <span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Token selector */}
          <div className="relative">
            <button
              onClick={() => { setShowTokenMenu(!showTokenMenu); setShowChainMenu(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all"
            >
              <span className="text-lg">{fromToken.icon}</span>
              <span className="font-display font-semibold text-[#e4e4e7]">{fromToken.symbol}</span>
              <svg className="w-3 h-3 text-[#52525b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTokenMenu && (
              <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl bg-[#111111] border border-[rgba(255,255,255,0.08)] shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                {tokensForChain.map(token => (
                  <button
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-all ${
                      token.address === fromToken.address ? 'text-[#00d4aa]' : 'text-[#a1a1aa]'
                    }`}
                  >
                    <span className="text-base">{token.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-[#e4e4e7]">{token.symbol}</div>
                      <div className="text-xs text-[#52525b]">{token.name}</div>
                    </div>
                    {token.address === fromToken.address && <span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount input */}
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setQuote(null); setStatus('idle'); }}
            className="min-w-0 flex-1 bg-transparent text-2xl font-display font-bold text-[#e4e4e7] placeholder-[#3f3f46] outline-none text-right"
            min="0"
          />
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#52525b]">
          ↓
        </div>
      </div>

      {/* To */}
      <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#52525b]">To</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-sm">
            <span>◎</span>
            <span className="text-[#e4e4e7]">Base</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-lg">◎</span>
            <span className="font-display font-semibold text-[#e4e4e7]">USDC</span>
          </div>
          <div className="flex-1 text-right">
            {quote ? (
              <span className="text-2xl font-display font-bold text-[#00d4aa]">
                {formatUSDC(quote.estimate?.toAmount || '0')}
              </span>
            ) : (
              <span className="text-2xl font-display font-bold text-[#3f3f46]">0.00</span>
            )}
          </div>
        </div>
        {quote && (
          <div className="mt-2 flex items-center justify-between text-xs text-[#52525b]">
            <span>via {quote.toolDetails?.name || quote.tool}</span>
            <span>~{quote.estimate?.executionDuration}s</span>
          </div>
        )}
      </div>

      {/* Status */}
      {statusText && status === 'bridging' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.15)]">
          <svg className="animate-spin w-4 h-4 text-[#00d4aa]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs text-[#00d4aa]">{statusText}</p>
        </div>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.3)]">
          <span className="text-xl">✓</span>
          <div>
            <p className="font-medium text-[#00d4aa]">Bridge complete!</p>
            <p className="text-xs text-[#a1a1aa]">USDC is on Base. Switch to "Direct" tab to deposit.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#ef4444] mb-1">Transaction Failed</p>
              <p className="text-xs text-[#fca5a5]">{error}</p>
            </div>
            <button
              onClick={() => {
                setError('');
                setStatus('quoted');
              }}
              className="text-xs text-[#ef4444] hover:text-[#fca5a5] underline flex-shrink-0"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Action */}
      {status !== 'done' && (
        status === 'quoted' ? (
          <button
            onClick={handleBridge}
            disabled={status === 'bridging' as BridgeStatus}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            Bridge → {formatUSDC(quote?.estimate?.toAmount || '0')} USDC on Base
          </button>
        ) : (
          <button
            onClick={handleGetQuote}
            disabled={!amount || !address || status === 'quoting' || status === 'bridging'}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            {status === 'quoting' ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Getting Quote...
              </>
            ) : (
              'Get Quote'
            )}
          </button>
        )
      )}
    </div>
  );
}
