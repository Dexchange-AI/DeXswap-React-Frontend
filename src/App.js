import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import "./App.css";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import Web3 from "web3";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import contract from "./build/contracts/DeXswap.json";

function App() {
  const [ethAmount, setEthAmount] = useState(0.143);
  const [dxcAmount, setDxcAmount] = useState(1);

  useEffect(() => {
    setDxcAmount(ethAmount / 0.143);
  }, [ethAmount]);

  // contract util
  const [account, setAccount] = useState("");
  const [swapContract, setSwapContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minEthError, setMinEthError] = useState(false);

  async function loadWeb3() {
    let { ethereum, web3 } = window;

    if (ethereum) {
      await ethereum.request({ method: "eth_requestAccounts" });
      ethereum.autoRefreshOnNetworkChange = false;
    } else if (web3) {
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Consider using metamask or web3 compatible browser(Mist).");
    }

    // get ethereum accounts
    const accounts = await ethereum.request({ method: "eth_accounts" });
    setAccount(accounts[0]);
  }

  // still needs to be fixed
  async function loadBlockchainData() {
    // setup contract
    const { REACT_APP_API_KEY, REACT_APP_CONTRACT_ADDRESS } = process.env;
    const alchWeb3 = createAlchemyWeb3(REACT_APP_API_KEY);

    const ethContract = new alchWeb3.eth.Contract(
      contract.abi,
      REACT_APP_CONTRACT_ADDRESS
    );
    setSwapContract(ethContract);

    setLoading(false);
  }

  useEffect(() => {
    (async function fetchData() {
      await loadWeb3();
      await loadBlockchainData();
    })();
  }, []);

  const swap = async () => {
    if (ethAmount < 0.143) {
      setMinEthError(true);
      return false;
    }
    setLoading(true);

    await swapContract.methods
      .swap((dxcAmount * Math.pow(10, 18)).toString())
      .send({
        from: account,
        value: ethAmount * Math.pow(10, 18),
      })
      .on("transactionHash", () => {
        setLoading(false);
        setMinEthError(false);
      });
  };

  return (
    <div className="App">
      {!loading && (
        <div>
          {minEthError && (
            <div className="errorMessage">
              Minimum amount of ETH required is 0.143!
            </div>
          )}
          <form>
            <div className="inputParent">
              ETH
              <input
                className="swapInput"
                type="text"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
              />
            </div>
            <ArrowForwardIcon className="arrow" />
            <div className="inputParent">
              DXC
              <input
                className="swapInput"
                type="text"
                value={dxcAmount.toFixed(3)}
                disabled={true}
              />
            </div>
            {/* <Button disabled={dxcAmount === 1 && true} onClick={() => swap()}>Swap</Button> */}
            <Button onClick={() => swap()}>Swap</Button>
          </form>
        </div>
      )}
      {loading && <h3>Loading Swap Calculator...</h3>}
    </div>
  );
}

export default App;
