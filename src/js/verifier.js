App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
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
    web3.eth.defaultAccount=web3.eth.accounts[0]
  },

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
      
    //Disable idHash checkbox on Page (App) Rendering
    document.getElementById("chkbox_idHash").disabled = true;

    //Call hospitalList mapping of Verifier smart contract and pass the result (array) to a variable
    const hospital = await App.verifier.hospitalList(App.account);
    if (hospital[0] != App.account){
      //Check if connected wallet address does not belong to a registered hospital
      alert("You are not registered yet!");
      window.location.href = "index.html";
    } 
  },

  sendRequest: async () => {    
    const citizenWalletAddress = document.getElementById("citizenWalletAddress").value;

    //Call the checkExists() function of the Issuer smart contract to check if the above wallet address (the value of citizenWalletAddress textfiled)  
    //belongs to a registered citizen and pass the result (array) to a variable
    const result = await App.issuer.checkExists(citizenWalletAddress);
              
    if (result === false) {
        alert("Wallet address is not registered yet!");
    } else {         
      //If result is true (wallet address is registered) initialize request's variables                         
      let citizenFullName= 0;
      let citizenSSN = 0;
      let citizenTIN = 0;
      let citizenDOB = 0;
      let citizenMobile = 0;
      let citizenIdIssuer = 0;
      let citizenIdHash = 1;  //Always checked
      let requestStatus = 1;  //Waiting Approval
      const dateRequested = new Date().toLocaleString();

      //Call the getHospitalInfo() function of the Verifier smart contract and pass the result (array) to a variable
      const hospital = await App.verifier.getHospitalInfo(App.account);            
      const requestedByName = hospital[1];
      const requestedByAddress = hospital[0];

      //Check if each checkbox is checked and pass to the corresponding variable the value "1" (Waiting Approval)
      //If a checkbox is not checked, its value will remaing 0, meaning that it will not be included to the request
      if(document.getElementById("chkbox_fullName").checked) {
        citizenFullName = 1;
      };
      if(document.getElementById("chkbox_ssn").checked) {
        citizenSSN = 1;
      };
      if(document.getElementById("chkbox_tin").checked) {
        citizenTIN = 1;
      };
      if(document.getElementById("chkbox_dob").checked) {
        citizenDOB = 1;
      };
      if(document.getElementById("chkbox_mobile").checked) {
        citizenMobile = 1;
      };
      if(document.getElementById("chkbox_issuedBy").checked) {
        citizenIdIssuer = 1;
      };

      try {
        //Send a transaction to sendRequest() function of Verifier smart contract 
        await App.verifier.sendRequest(requestedByName, requestedByAddress, citizenWalletAddress, citizenFullName, citizenSSN, citizenTIN, citizenDOB, citizenMobile, citizenIdIssuer, citizenIdHash, requestStatus, dateRequested, {from: App.account});
              
        //Call IsSuccessful event from Verifier smart contract and watch for its result
        const eventSuccess = App.verifier.IsSuccessful();
          eventSuccess.watch(function(error, res) {            
              if (!error && res.args.result === true) {
                alert("Success");
                window.location.reload();
              }
          }); 
      } catch {
        alert("Something went wrong");
      }
    }; 
  },

  walletConnectButton: async () => {
    try {
      // Will open the MetaMask UI and request a wallet connection
      await window.ethereum.request({ method: "eth_requestAccounts"});;
    } catch {
      console.error("User rejected the request.");
    }
  }
}

$(() => {
  //Load the App object
  $(window).load(() => {
      App.load()
  })
})