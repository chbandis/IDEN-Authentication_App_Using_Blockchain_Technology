App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadCitizenContract();
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
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);      
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0];
    web3.eth.defaultAccount=web3.eth.accounts[0];
  },

  loadCitizenContract: async () => {
    // Create a JavaScript version of the Citizen smart contract
      const citizen = await $.getJSON('Citizen.json');
      App.contracts.Citizen = TruffleContract(citizen);
      App.contracts.Citizen.setProvider(App.web3Provider);

      App.citizen = await App.contracts.Citizen.deployed();
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

    //Call citizenList mapping of Citizen smart contract and pass the result (array) to a variable
    const citizen = await App.citizen.citizenList(App.account);
    if (citizen[0] != App.account){
      //Check if connected wallet address does not belong to a registered citizen
      alert("You are not registered yet!");
      window.location.href = "index.html";           
    } else {
      //Call requestsWaiting() function of Verifier smart contract and pass the result to a variable
      const result = await App.verifier.requestsWaiting(App.account);
      const $citizenInfoContainer = $('#citizenInfoContainer');
      //Append the result to the notification icon
      $citizenInfoContainer.find('#notification').html(`<div class='icon-wrapper' data-number='${result.toNumber()}'>
                                                          <img src='/img/notification-32.png' alt='' class='bell-icon' onclick='location.href=\"./citizenViewRequests.html\"'>
                                                        </div>`);
      $('#citizenInfoContainer').append($citizenInfoContainer);
      $citizenInfoContainer.show();    

      // Render Citizen's info
      await App.renderInfo();
    }
  },

  renderInfo: async () => { 
    //Call citizenList mapping of Citizen smart contract and pass the result (array) to a variable
    const citizen = await App.citizen.citizenList(App.account);
      
    //Pass the values of the array to variables
    const walletAddress = citizen[0];
    const fullName = citizen[1];
    const ssn = citizen[2].toNumber();
    const tin = citizen[3].toNumber();
    const dob = citizen[4];
    const mobile = citizen[5].toNumber();
    const email = citizen[6];
    const homeAddress = citizen[7];
    const issuedBy = citizen[8];
    const idHash = citizen[9];
    
    //Change the value of each <td> id to the corresponding variable's value
    const $table = $('.table');
    $table.find('#walletAddress').html(walletAddress);
    $table.find('#fullName').html(fullName);
    $table.find('#ssn').html(ssn);
    $table.find('#tin').html(tin);
    $table.find('#dob').html(dob);
    $table.find('#mobile').html(mobile);
    $table.find('#email').html(email);
    $table.find('#homeAddress').html(homeAddress);
    $table.find('#issuedBy').html(issuedBy);
    $table.find('#idHash').html(idHash);

    //Append the new values and show the table
    $('#table').append($table);
    $table.show();

    //Create the HTML for the generate QR code button, append it to citizenInfoContainer and show it
    const $citizenInfoContainer = $('#citizenInfoContainer');
    $citizenInfoContainer.find('#generateQR').html(`<button id='generateQR-btn' type='submit' class='btn btn-default' data-toggle="modal" data-target="#modalQRCode" onclick='App.generateQRCode(\"${walletAddress}\")'>Generate QR Code</button>`);
    $('#citizenInfoContainer').append($citizenInfoContainer);
    $citizenInfoContainer.show();
  },

  generateQRCode: async (walletAddress) => {
    //Create the HTML for the modal that contains the QR Code
    const $modalQRCode = $('#modalQRCode');
    $modalQRCode.find('#qrCode').html('');
    $('#modalQRCode').append($modalQRCode);
    $modalQRCode.show();

    //Create the QR Code based on the value of the passed walletAddress variable
    qrcode = new QRCode(document.getElementById('qrCode'), walletAddress);
    document.getElementById('qrCode').style.display="inline-block";     
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