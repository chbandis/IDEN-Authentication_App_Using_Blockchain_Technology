App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    //await App.loadOwnableContract();
    await App.loadIssuerContract();
    await App.loadVerifierContract();
    await App.render();
  },

  loadWeb3: async () => {
    //Connect to blockchain using web3.js library
    if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          await window.ethereum.request({ method: "eth_requestAccounts"});
        } catch (error) {
          console.error("User denied account access");
        }
      } else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      } else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      }
      web3 = new Web3(App.web3Provider);      
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0];
  },

  // loadOwnableContract: async () => {
  //   // Create a JavaScript version of the Ownable smart contract
  //   const ownable = await $.getJSON('Ownable.json');
  //   App.contracts.Ownable = TruffleContract(ownable);
  //   App.contracts.Ownable.setProvider(App.web3Provider);

  //   App.ownable = await App.contracts.Ownable.deployed();
  // },

  loadIssuerContract: async () => {
    // Create a JavaScript version of the Issuer smart contract
    const issuer = await $.getJSON('Issuer.json');
    App.contracts.Issuer = TruffleContract(issuer);
    App.contracts.Issuer.setProvider(App.web3Provider);

    App.issuer = await App.contracts.Issuer.deployed();
  },

  loadVerifierContract: async () => {
    // Create a JavaScript version of the Verifier smart contract
    const verifier = await $.getJSON('Verifier.json');
    App.contracts.Verifier = TruffleContract(verifier);
    App.contracts.Verifier.setProvider(App.web3Provider);

    App.verifier = await App.contracts.Verifier.deployed();
  },

  render: async () => {  

    web3.eth.getAccounts(function(err, accounts){
      //Get connected wallet accounts
      if (accounts.length != 0) {
        //Get the wallet address of the connected wallet, pass it as a value to account button
        //and change the cursor style with an event listener
        try {
          const connectBtn = document.getElementById('account-btn');
          const account = App.account; 
          const addrStart = account.slice(0,7);
          const addrEnd = account.slice(35,42);
          $('#account-btn').html(addrStart + "..." + addrEnd); 
          connectBtn.addEventListener('mouseover', function(){
            connectBtn.style.cursor = "default"; });
        } catch {
          console.log("No wallet is connected yet.");
        }
      } else if (err != null) {
        console.error("An error occurred: "+err);
      }
    });

    // //Call issuerList mapping of Ownable smart contract and pass the result (array) to a variable
    // const issuer = await App.ownable.issuerList(App.account);
    // if(issuer[0] != App.account) {
    //   //Check if connected wallet address does not belong to a registered issuer
    //   alert("You are not allowed!");
    //   window.location.href = "index.html";        
    // };
  },
  
  issueID: async () => {
    //Get the values of the textfields
    const walletAddress = $('#walletAddress').val();
    const hospitalName = $('#hospitalName').val();       
    const issuerAddress = App.account;

    //Form Validation
    if (!/^(0x)?[0-9a-f]{40}$/i.test(walletAddress)) {
      alert("Wallet Address is not valid");
    } else {
      try {
        //Send a transaction to addHospital() function of Verifier smart contract and pass its result to a variable
        const result = await App.verifier.addHospital(walletAddress, hospitalName, issuerAddress, {from: App.account});
        
        //Call IsSuccessful event from Verifier smart contract and watch for its result
        const eventSuccess = App.verifier.IsSuccessful();
        eventSuccess.watch(async function(error, res) {            
            if (!error && res.args.result === true) {
              //Get the transaction hash (result.tx) and pass it to the setHospitalHash() and setHospitalInfo() functions of
              //Verifier smart contract and Issuer smart contract respectively
              try{
                await App.verifier.setHospitalHash(walletAddress, result.tx, {from: App.account});
                await App.issuer.setHospitalInfo(walletAddress, result.tx, {from: App.account});
                alert("Success");    
                window.location.reload();      
              } catch {
                alert("Something went wrong");
              }               
            }
          }); 
        //Call AddressExists event from Verifier smart contract, watch for its result and show the corresponding alert
        const eventExists = App.verifier.AddressExists();
        eventExists.watch(function(error, res) {            
            if (!error && res.args.exists === true) {
              alert("Wallet Address already exists");
            }; 
        }); 
      } catch {
          alert("Something went wrong");
        }     
    }   
  },
  
  walletConnectButton: async () => {
    try {
      // Will open the MetaMask UI and request a wallet connection
      await window.ethereum.request({ method: "eth_requestAccounts"});
    } catch {
      console.error("User rejected the request.");
    }
  },
}

$(() => {
  //Load the App object
  $(window).load(() => {
      App.load()
  })
})