// src/SavingsAccount.js
export const savingsState = {
    contributions: [], // { address: string, amount: number }
    recipients: [],     // All unique contributors
    paid: [],           // Track who already got paid
  };
  
  // Record contribution from a friend
  export function recordContribution(address, amount) {
    savingsState.contributions.push({ address, amount: parseFloat(amount) });
    if (!savingsState.recipients.includes(address)) {
      savingsState.recipients.push(address);
    }
  }
  
  // Decide who to pay next (round-robin)
  export function getNextRecipient() {
    const unpaid = savingsState.recipients.filter(r => !savingsState.paid.includes(r));
    return unpaid.length ? unpaid[0] : null;
  }
  
  // Mark as paid
  export function markAsPaid(address) {
    savingsState.paid.push(address);
  }
  
  // Calculate a return amount (> contribution)
  export function calculatePayout(address) {
    const contribution = savingsState.contributions.find(c => c.address === address);
    if (!contribution) return 0;
    return (contribution.amount * 1.1).toFixed(4); // Pay back 10% more
  }
  