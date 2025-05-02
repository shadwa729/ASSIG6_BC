// src/App.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  recordContribution,
  getNextRecipient,
  markAsPaid,
  calculatePayout,
  savingsState
} from './SavingsAccount';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isSavingsWallet, setIsSavingsWallet] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
        if (accounts.length > 0) {
          const signer = await web3Provider.getSigner();
          setSigner(signer);
          setAccount(accounts[0]);
          const balance = await web3Provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance).slice(0, 6));
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = provider.getSigner();
      setSigner(signer);
      setAccount(accounts[0]);
      const balance = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balance).slice(0, 6));
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const contributeToSavings = async () => {
    if (!ethers.isAddress(recipient)) {
      alert('Invalid recipient address!');
      return;
    }

    try {
      setTxStatus('Sending contribution...');
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
        gasLimit: 21000,
      });
      await tx.wait();
      setTxStatus(`Contribution sent! Hash: ${tx.hash}`);
      recordContribution(account, amount);
    } catch (error) {
      setTxStatus(`Error: ${error.message}`);
    }
  };

  const distributeFromSavings = async () => {
    const next = getNextRecipient();
    if (!next) {
      setTxStatus("All recipients have been paid.");
      return;
    }

    const payout = calculatePayout(next);
    try {
      setTxStatus(`Paying ${next}...`);
      const tx = await signer.sendTransaction({
        to: next,
        value: ethers.parseEther(payout),
        gasLimit: 21000,
      });
      await tx.wait();
      markAsPaid(next);
      setTxStatus(`Paid ${next} (${payout} ETH). Tx hash: ${tx.hash}`);
    } catch (err) {
      setTxStatus(`Payment failed: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <h1>Savings Account DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p><strong>Account:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>
          <h3>Send Ether to Savings Account</h3>
          <input type="text" placeholder="Savings Wallet Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <input type="number" step="0.001" placeholder="Amount (ETH)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button onClick={contributeToSavings}>Send to Savings</button>

          <h3>Distribute Ether (Savings Account only)</h3>
          <button onClick={distributeFromSavings}>Distribute Payout</button>

          <p>{txStatus}</p>
        </>
      )}
    </div>
  );
}

export default App;

