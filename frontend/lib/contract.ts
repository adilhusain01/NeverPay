import { ethers } from 'ethers';

const YIELD_VAULT_ABI = [
  'function useCredits(address user, uint256 amount, string calldata action, bytes32 actionId) external',
  'function getAvailableCredits(address user) external view returns (uint256)',
];

let _contract: ethers.Contract | null = null;

export function getContract(): ethers.Contract | null {
  if (_contract) return _contract;

  const { RPC_URL, BACKEND_PRIVATE_KEY, YIELD_VAULT_ADDRESS } = process.env;

  if (!RPC_URL || !BACKEND_PRIVATE_KEY || !YIELD_VAULT_ADDRESS ||
      YIELD_VAULT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return null;
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider);
    _contract = new ethers.Contract(YIELD_VAULT_ADDRESS, YIELD_VAULT_ABI, signer);
    return _contract;
  } catch {
    return null;
  }
}

export async function checkCredits(userAddress: string): Promise<boolean> {
  const contract = getContract();
  if (!contract) return true; // allow if no contract
  const credits = await contract.getAvailableCredits(userAddress);
  return BigInt(credits.toString()) >= BigInt(1);
}

export async function deductCredit(userAddress: string, action: string): Promise<void> {
  const contract = getContract();
  if (!contract) return;
  try {
    const actionId = ethers.id(`${userAddress}-${Date.now()}-${action}`);
    const tx = await contract.useCredits(userAddress, 1, action, actionId);
    await tx.wait();
  } catch (e) {
    console.warn('Failed to deduct credit:', e);
  }
}
