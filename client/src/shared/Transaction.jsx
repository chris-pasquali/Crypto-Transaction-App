import { ethers } from "ethers";
import { setGlobalState } from "../store";

import { contractAbi, contractAddress } from "../utils/constants";

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );

  return transactionContract;
};

const isWalletConnected = async () => {
  try {
    if (!ethereum) {
      return alert("Please install Metamask");
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setGlobalState("connectedAccount", accounts[0]);
      } else {
        console.log("No Accounts found!");
      }
    }
  } catch (err) {
    console.log(err);
    throw new Error("No ethereum object.");
  }
};

const checkIfTransactionExist = async () => {
  try {
    const transactionContract = getEthereumContract();
    const transactionCount = await transactionContract.getTransactionsCount();

    window.localStorage.setItem("transactionCount", transactionCount);
  } catch (err) {
    console.loga(err);
    throw new Error("No ethereum object.");
  }
};

const connectWallet = async () => {
  try {
    if (!ethereum) {
      return alert("Please install Metamask");
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    console.log(accounts);
    setGlobalState("connectedAccount", accounts[0]);
  } catch (err) {
    console.log(err);
    throw new Error("No Ethereum object.");
  }
};

const sendMoney = async ({ connectedAccount, address, amount, remark }) => {
  try {
    if (!ethereum) {
      return alert("Please install Metamask");
    }
    const transactionContract = getEthereumContract();
    const parsedAmount = ethers.utils.parseEther(amount);

    await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: connectedAccount,
          to: address,
          gas: "0x5208",
          value: parsedAmount._hex,
        },
      ],
    });

    const transactionHash = await transactionContract.sendMoney(
      address,
      parsedAmount,
      remark
    );
    console.log(`Loading - ${transactionHash.hash}`);
    await transactionHash.wait();
    console.log(`Success - ${transactionHash.hash}`);

    const transactionCount = await transactionContract.getTransactionsCount();
    setGlobalState("transactionCount", transactionCount.toNumber());

    window.location.reload();
  } catch (err) {
    console.log(err);
    throw new Error("No ethereum object.");
  }
};

const getAllTransactions = async () => {
  try {
    if (!ethereum) {
      return alert("Please install Metamask");
    }
    const transactionContract = getEthereumContract();
    const availableTransactions =
      await transactionContract.getAllTransactions();

    const structuredTransactions = availableTransactions
      .map((tx) => ({
        receiver: tx.receiver,
        sender: tx.sender,
        timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
        remark: tx.remark,
        amount: parseInt(tx.amount._hex) / 10 ** 18,
      }))
      .reverse();

      setGlobalState('transactions', structuredTransactions)
      return structuredTransactions;
  } catch (err) {
    console.log(err);
    throw new Error("No ethereum object.");
  }
};

export {
  getEthereumContract,
  isWalletConnected,
  checkIfTransactionExist,
  connectWallet,
  sendMoney,
  getAllTransactions,
};
