App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    //await App.loadOwnableContract();
    await App.loadIssuerContract();
    await App.loadCitizenContract();
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

  loadCitizenContract: async () => {
    // Create a JavaScript version of the Citizen smart contract
    const citizen = await $.getJSON('Citizen.json');
    App.contracts.Citizen = TruffleContract(citizen);
    App.contracts.Citizen.setProvider(App.web3Provider);

    App.citizen = await App.contracts.Citizen.deployed();
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
    //Get the values of the input fields
    const walletAddress = $('#walletAddress').val();
    const fullName = $('#fullName').val();
    const ssn = $('#ssn').val();
    const tin = $('#tin').val();
    const dob = $('#dob').val();
    const mobile = $('#mobile').val();
    const email = $('#email').val();
    const homeAddress = $('#homeAddress').val();
    const issuerAddress = App.account;

    //Form Validation
    if (!/^(0x)?[0-9a-f]{40}$/i.test(walletAddress)) {
      alert("Wallet Address is not valid");
    } else if(/\d/.test(fullName)){
      alert("Full Name is not valid");
    } else if (isNaN(ssn)) {
      alert("Social Security Number is not valid");
    } else if (ssn.length < 5 || ssn.length > 10 ) {
      alert("Social Security Number must be between 5 and 10 characters in length");
    } else if (isNaN(tin)) {
      alert("Tax Identification Number is not valid!");
    } else if (isNaN(tin) || tin.length < 5 || tin.length > 10) {
      alert("Tax Identification Number must be between 5 and 10 characters in length");
    } else if (isNaN(mobile)) {
      alert("Mobile Number is not valid");
    } else if (mobile.length != 10 ) {
      alert("Mobile Number must be 10 characters in length");
    } else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
      alert("Email is not valid");
    } else {
      try {
        //Send a transaction to addCitizenInfo() function of Citizen smart contract and pass its result to a variable
        const result = await App.citizen.addCitizenInfo(walletAddress, fullName, ssn, tin, dob, mobile, email, homeAddress, issuerAddress, {from: App.account});

        //Call IsSuccessful event from Citizen smart contract and watch for its result
        const eventSuccess = App.citizen.IsSuccessful();
        eventSuccess.watch(async function(error, res) {            
            if (!error && res.args.result === true) {
              //Get the transaction hash (result.tx) and pass it to the setIdHash() and setCitizenInfo() functions of
              //Citizen smart contract and Issuer smart contract respectively
              try{
                await App.citizen.setIdHash(walletAddress, result.tx, {from: App.account});
                await App.issuer.setCitizenInfo(walletAddress, result.tx, {from: App.account});
                alert("Success");     
                window.location.reload();       
              } catch {
                alert("Something went wrong");
              }        
            }
          }); 
        //Call AddressExists event from Citizen smart contract, watch for its result and show the corresponding alert
        const eventExists = App.citizen.AddressExists();
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
  }
}

$(() => {
  //Load the App object
  $(window).load(() => {
      App.load()
  })
})