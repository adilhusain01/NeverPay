> ## Documentation Index
> Fetch the complete documentation index at: https://docs.li.fi/llms.txt
> Use this file to discover all available pages before exploring further.

# End-to-end Transaction Example

## Step by step

<Steps>
  <Step title="Requesting a quote or routes">
    <CodeGroup>
      ```ts TypeScript theme={"system"}
      const getQuote = async (fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) => {
          const result = await axios.get('https://li.quest/v1/quote', {
              params: {
                  fromChain,
                  toChain,
                  fromToken,
                  toToken,
                  fromAmount,
                  fromAddress,
              }
          });
          return result.data;
      }

      const fromChain = 42161;
      const fromToken = 'USDC';
      const toChain = 100;
      const toToken = 'USDC';
      const fromAmount = '1000000';
      const fromAddress = YOUR_WALLET_ADDRESS;

      const quote = await getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress);
      ```
    </CodeGroup>
  </Step>

  <Step title="Choose the desired route if `/advanced/routes` was used and retrieve transaction data from `/advanced/stepTransaction`">
    <Note>
      This step is only needed if `/advanced/routes` endpoint was used. `/quote` already returns the transaction data within the response. Difference between `/quote` and `/advanced/routes` is described [here](/introduction/user-flows-and-examples/difference-between-quote-and-route)
    </Note>
  </Step>

  <Step title="Setting the allowance">
    Before any transaction can be sent, it must be made sure that the user is allowed to send the requested amount from the wallet.

    <CodeGroup>
      ```ts TypeScript theme={"system"}
      const { Contract } = require('ethers');

      const ERC20_ABI = [
          {
              "name": "approve",
              "inputs": [
                  {
                      "internalType": "address",
                      "name": "spender",
                      "type": "address"
                  },
                  {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                  }
              ],
              "outputs": [
                  {
                      "internalType": "bool",
                      "name": "",
                      "type": "bool"
                  }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
          },
          {
              "name": "allowance",
              "inputs": [
                  {
                      "internalType": "address",
                      "name": "owner",
                      "type": "address"
                  },
                  {
                      "internalType": "address",
                      "name": "spender",
                      "type": "address"
                  }
              ],
              "outputs": [
                  {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          }
      ];

      // Get the current allowance and update it if needed
      const checkAndSetAllowance = async (wallet, tokenAddress, approvalAddress, amount) => {
          // Transactions with the native token don't need approval
          if (tokenAddress === ethers.constants.AddressZero) {
              return
          }

          const erc20 = new Contract(tokenAddress, ERC20_ABI, wallet);
          const allowance = await erc20.allowance(await wallet.getAddress(), approvalAddress);

          if (allowance.lt(amount)) {
              const approveTx = await erc20.approve(approvalAddress, amount);
              await approveTx.wait();
          }
      }

      await checkAndSetAllowance(wallet, quote.action.fromToken.address, quote.estimate.approvalAddress, fromAmount);
      ```
    </CodeGroup>
  </Step>

  <Step title="Sending the transaction">
    After receiving a quote, the transaction has to be sent to trigger the transfer.

    Firstly, the wallet has to be configured. The following example connects your wallet to the Gnosis Chain.

    <CodeGroup>
      ```ts TypeScript theme={"system"}
      const provider = new ethers.providers.JsonRpcProvider('https://rpc.xdaichain.com/', 100);
      const wallet = ethers.Wallet.fromMnemonic(YOUR_PERSONAL_MNEMONIC).connect(
          provider
      );
      ```
    </CodeGroup>

    Afterward, the transaction can be sent using the `transactionRequest` inside the previously retrieved quote:

    <CodeGroup>
      ```ts TypeScript theme={"system"}
      const tx = await wallet.sendTransaction(quote.transactionRequest);
      await tx.wait();
      ```
    </CodeGroup>
  </Step>

  <Step title="Executing second step if applicable">
    If two-step route was used, the second step has to be executed after the first step is complete. Fetch the status of the first step like described in next step and then request transactionData from the `/advanced/stepTransaction` endpoint.
  </Step>

  <Step title="Fetching the transfer status">
    To check if the token was successfully sent to the receiving chain, the /status endpoint can be called:

    <CodeGroup>
      ```ts TypeScript theme={"system"}
      const getStatus = async (bridge, fromChain, toChain, txHash) => {
          const result = await axios.get('https://li.quest/v1/status', {
              params: {
                  bridge,
                  fromChain,
                  toChain,
                  txHash,
              }
          });
          return result.data;
      }

      result = await getStatus(quote.tool, fromChain, toChain, tx.hash);
      ```
    </CodeGroup>
  </Step>
</Steps>

## Full example

<CodeGroup>
  ```ts TypeScript theme={"system"}
  const ethers = require('ethers');
  const axios = require('axios');

  const API_URL = 'https://li.quest/v1';

  // Get a quote for your desired transfer
  const getQuote = async (fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) => {
      const result = await axios.get(`${API_URL}/quote`, {
          params: {
              fromChain,
              toChain,
              fromToken,
              toToken,
              fromAmount,
              fromAddress,
          }
      });
      return result.data;
  }

  // Check the status of your transfer
  const getStatus = async (bridge, fromChain, toChain, txHash) => {
      const result = await axios.get(`${API_URL}/status`, {
          params: {
              bridge,
              fromChain,
              toChain,
              txHash,
          }
      });
      return result.data;
  }

  const fromChain = 42161;
  const fromToken = 'USDC';
  const toChain = 100;
  const toToken = 'USDC';
  const fromAmount = '1000000';
  const fromAddress = YOUR_WALLET_ADDRESS;

  // Set up your wallet
  const provider = new ethers.providers.JsonRpcProvider('https://rpc.xdaichain.com/', 100);
  const wallet = ethers.Wallet.fromMnemonic(YOUR_PERSONAL_MNEMONIC).connect(
      provider
  );

  const run = async () => {
      const quote = await getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress);
      const tx = await wallet.sendTransaction(quote.transactionRequest);

      await tx.wait();

      // Only needed for cross chain transfers
      if (fromChain !== toChain) {
          let result;
          do {
              result = await getStatus(quote.tool, fromChain, toChain, tx.hash);
          } while (result.status !== 'DONE' && result.status !== 'FAILED')
      }
  }

  run().then(() => {
      console.log('DONE!')
  });
  ```
</CodeGroup>
