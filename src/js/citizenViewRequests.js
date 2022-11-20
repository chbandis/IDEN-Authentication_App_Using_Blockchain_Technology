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
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
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
        //Render Requests
        await App.renderRequests();
    };
  },

  renderRequests: async () => {
    //Call the requestLength() function of the Verifier smart contract and pass the result to a variable
    const requests = await App.verifier.requestLength(App.account);
    const requestLength = requests.toNumber();

    for(let i = 0; i < requestLength; i++){
      App.viewRequests(i);
    };    
  },

  viewRequests: async (reqIndex) => {
    //Load the requests, depending on the connected citizen's wallet address and the request id, calling
    //the viewRequestCollapsed() function of the Verifier smart contract and pass the result (array) to a variable
    const request = await App.verifier.viewRequestCollapsed(App.account, reqIndex);

    //Pass the values of the array to variables
    const institutionName = request[0];
    const requestStatus = request[1].toNumber();
    const dateRequested = request[2];

    //Insert HTML to requestsTable according to requestStatus 
    const requestsTable = document.getElementById("requestsTable");
    let requestStatusText = "";    

    if(requestStatus == 1) {
      requestStatusText = "Waiting Approval";
      var addToTable =  `<tr>
                            <td class='text-center'>${institutionName}</td>
                            <td class='text-center'>${dateRequested}</td>
                            <td class='text-center'>${requestStatusText}&nbsp;<img src='img/mail-by-timer-32.png' alt='Waiting for approval'></td>                            
                            <td align='center'><button type='button' class='btn btn-default' onClick='App.viewRequestDetails(\"${reqIndex}\")'>View Details</button></td>
                          </tr>`;                         
    } else if(requestStatus == 2){
      requestStatusText =  "Partially Approved";
      var addToTable = `<tr>
                          <td class='text-center'>${institutionName}</td>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/marked-mail-32.png' alt='Approved or partially approved'></td>
                          <td align='center'>&nbsp;</td>
                        </tr>`;
    } else if(requestStatus == 3){
      requestStatusText = "Approved";
      var addToTable = `<tr>
                          <td class='text-center'>${institutionName}</td>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/marked-mail-32.png' alt='Approved or partially approved'></td>
                          <td align='center'>&nbsp;</td>
                        </tr>`;
    } else if(requestStatus == 4){
      requestStatusText = "Rejected";
      var addToTable = `<tr>
                          <td class='text-center'>${institutionName}</td>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/remove-mail-32.png' alt='Rejected'></td>
                          <td align='center'>&nbsp;</td>
                        </tr>`;
    }
    requestsTable.insertAdjacentHTML('beforeend',addToTable);      
  },


  viewRequestDetails: async (reqIndex) => {
    //Create a new displayTable, Allow and Deny Access buttons everytime this fuctions is called to avoid duplicates
    const $requestContainer = $('#requestsContainer');
    $requestContainer.find('#displayTable').html(`<table  class='table table-bordered'  id='displaytable'>
                                                    <tr>
                                                        <td colspan='2' align='center'><b>Requested information</b></td>
                                                    </tr>
                                                  </table>`);
    $requestContainer.find('#requestButtons').html(`<div class='form-group'> 
                                                      <button id='allow-btn' type='submit' class='btn btn-default' onClick='App.allowAccess(\"${reqIndex}\"); return false;'>Allow Access</button>
                                                      <button id='deny-btn' type='submit' class='btn btn-default' onClick='App.denyAccess(\"${reqIndex}\"); return false;'>Deny Access</button>                                                    
                                                    </div>`);
    $('#requestsContainer').append($requestContainer);
    $requestContainer.show();      

    //Load the details of the request, depending on the connected citizen's wallet address and the request id that was passed to the function, 
    //calling the viewRequestExpanded() function of the Verifier smart contract and pass the result (array) to a variable
    const request =  await App.verifier.viewRequestExpanded(App.account, reqIndex); 

    const requestedByName = request[0];
    const requestedByAddress = request[1];
    const fullName = request[2].toNumber();
    const ssn = request[3].toNumber();
    const tin = request[4].toNumber();
    const dob = request[5].toNumber();
    const mobile = request[6].toNumber();
    const issuedBy = request[7].toNumber();
    const idHash = request[8].toNumber();

    //Append the requestedByName and requestedByAddress values to displayTableParent and show the table
    const $requestTable = $('#displayTableParent');        
    $requestTable.find('#requestedByName').html(requestedByName);
    $requestTable.find('#requestedByAddress').html(requestedByAddress);
    $('#displayTableParent').append($requestTable);
    $requestTable.show();

    //Insert HTML to displayTable according to viewRequestExpanded() function results
    //If variable's value is 1 (i.e. its checkbox was checked by the verifier on the verifier.html) show the corresponding html 
    const requestsedInfoTable = document.getElementById("displayTable");

    if(fullName == 1){
      const listFullName = `<tr>
                            <td class='text-center' width='10%'><input type='checkbox' id='chkbox_fullName' name='chkbox'>
                            <td>Full Name</td>
                          </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listFullName);
    }
    if(ssn == 1){
      const listSsn = `<tr>
                        <td class='text-center' width='10%'><input type='checkbox' id='chkbox_ssn' name='chkbox'>
                        <td>Social Security Number</td>
                      </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listSsn);
    }
    if(tin == 1){
      const listTin = `<tr>
                        <td class='text-center' width='10%'><input type='checkbox' id='chkbox_tin' name='chkbox'>
                        <td>Tax Identification Number</td>
                      </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listTin);
    }
    if(dob == 1){
      const listDOB = `<tr>
                        <td class='text-center' width='10%'><input type='checkbox' id='chkbox_dob' name='chkbox'>
                        <td>Date of Birth</td>
                      </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listDOB);
    }
    if(mobile == 1){
      const listMobile = `<tr>
                          <td class='text-center' width='10%'><input type='checkbox' id='chkbox_mobile' name='chkbox'>
                          <td>Mobile Number</td>
                        </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listMobile);
    }
    if(issuedBy == 1){
      const listIssuedBy = `<tr>
                            <td class='text-center' width='10%'><input type='checkbox' id='chkbox_issuedBy' name='chkbox'>
                            <td>ID Issuer</td>
                          </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listIssuedBy);
    }
    if(idHash == 1){
      const listIdHash = `<tr>
                          <td class='text-center' width='10%'><input type='checkbox' id='chkbox_idHash' name='chkbox_idHash' checked>
                          <td>ID Hash</td>
                        </tr>`;
      requestsedInfoTable.insertAdjacentHTML('beforeend',listIdHash);
    } 
    document.getElementById("chkbox_idHash").disabled = true;

    //Insert the HTML of the Selected All and Deselect All buttons to displayTable everytime this function is called to avoid duplicates
    const listSelectBtns = `<tr>
                              <td colspan='2' align='left'>
                                  <button type='button' class='select-btn' onclick='select();'>Select All</button>
                                  <button type='button' class='select-btn' onclick='deSelect();'>Deselect All</button>
                              </td>
                          </tr>`;
    requestsedInfoTable.insertAdjacentHTML('beforeend',listSelectBtns);
  },

  allowAccess: async (reqIndex) => {
    try{
      //Load the details of the request, depending on the connected citizen's wallet address and the request id that was passed to the function, 
      //calling the viewRequestExpanded() function of the Verifier smart contract and pass the result (array) to a variable
      const request =  await App.verifier.viewRequestExpanded(App.account, reqIndex); 
      const fullName = request[2].toNumber();
      const ssn = request[3].toNumber();
      const tin = request[4].toNumber();
      const dob = request[5].toNumber();
      const mobile = request[6].toNumber();
      const issuedBy = request[7].toNumber();
      const idHash = request[8].toNumber();

      //Get the values of the textfields
      const isFullName = document.getElementById("chkbox_fullName");
      const isSsn = document.getElementById("chkbox_ssn");
      const isTin = document.getElementById("chkbox_tin");
      const isDob = document.getElementById("chkbox_dob");
      const isMobile = document.getElementById("chkbox_mobile");
      const isIssuedBy = document.getElementById("chkbox_issuedBy");
      const isIdHash = document.getElementById("chkbox_idHash");

      let requestStatus = 0;
      let sumSelected = 0;

      //Initialize the updated variables
      let updatedFullName = 0
      let updatedSsn = 0 
      let updatedTin = 0 
      let updatedDob = 0 
      let updatedMobile = 0 
      let updatedIssuedBy = 0
      let updatedIdHash = 0;

      let checkboxes = [];
  
      //If the variable which contains the result of the viewRequestExpanded() function is equal to 1 (i.e. its checkbox was checked by the verifier by the time
      //the request was submitted) and push a proper string to the checkboxes array 
      //Then change the value of the corresponding updated variable depending on citizen's choice (i.e. if the checkbox is checked)
      if(fullName == 1){
        checkboxes.push("fullNameChecked");
        if(isFullName.checked){
          updatedFullName = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedFullName = 2; //Deny access
        };
      };
      if(ssn == 1){
        checkboxes.push("ssnChecked");
        if(isSsn.checked){
          updatedSsn = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedSsn = 2; //Deny access
        };
      };
      if(tin == 1){
        checkboxes.push("tinChecked");
        if(isTin.checked){
          updatedTin = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedTin = 2; //Deny access
        };
      };
      if(dob == 1){
        checkboxes.push("dobChecked");
        if(isDob.checked){
          updatedDob = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedDob = 2; //Deny access
        };
      };
      if(mobile == 1){
        checkboxes.push("mobileChecked");
        if(isMobile.checked){
          updatedMobile = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedMobile = 2; //Deny access
        };
      };
      if(issuedBy == 1){
        checkboxes.push("issuedByChecked");
        if(isIssuedBy.checked){
          updatedIssuedBy = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedIssuedBy = 2; //Deny access
        };
      };
      if(idHash == 1){
        checkboxes.push("idhashChecked");
        if(isIdHash.checked){
          updatedIdHash = 1; //Allow access
          sumSelected += 1;
        } else{
          updatedIdHash = 2; //Deny access
        };
      };

      if (sumSelected == 0){
        requestStatus = 4; //Denied
      } else if (sumSelected == checkboxes.length){
        requestStatus = 3; //Allowed
      } else if (sumSelected < checkboxes.length){
        requestStatus = 2; //Partially Allowed
      };
      try {
        //Send a transaction to updateRequest() function of Verifier smart contract
        await App.verifier.updateRequest(App.account, reqIndex, updatedFullName, updatedSsn, updatedTin, updatedDob, updatedMobile, updatedIssuedBy, updatedIdHash, requestStatus, {from: App.account});
        
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

    } catch {
      console.log("Solidity throws an error for no reason");   //This error does not affect anything
      };
  },    

  denyAccess: async (reqIndex) => {
    try{
      //Set the updated variables value to 2 and requestStatus value to 4 (i.e. denied)
      const updatedFullName = 2;
      const updatedSsn = 2;
      const updatedTin = 2; 
      const updatedDob = 2; 
      const updatedMobile = 2; 
      const updatedIssuedBy = 2;
      const updatedIdHash = 2;
      const requestStatus = 4; 

        //Send a transaction to updateRequest() function of Verifier smart contract
        await App.verifier.updateRequest(App.account, reqIndex, updatedFullName, updatedSsn, updatedTin, updatedDob, updatedMobile, updatedIssuedBy, updatedIdHash, requestStatus, {from: App.account});
                
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