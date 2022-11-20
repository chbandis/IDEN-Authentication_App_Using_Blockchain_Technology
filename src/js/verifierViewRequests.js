App = {
    
  web3Provider: null,
  contracts: {},

  load: async () => {
    //Load necessary app functions
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadIssuerContract();
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
    web3.eth.defaultAccount=web3.eth.accounts[0]
  },

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

    //Call hospitalList mapping of Verifier smart contract and pass the result (array) to a variable
    const hospital = await App.verifier.hospitalList(App.account);
    if (hospital[0] != App.account){
      //Check if connected wallet address does not belong to a registered hospital
      alert("You are not registered yet!");
      window.location.href = "index.html";
    } 
  },

  renderRequests: async () => {
    //Create a new requestsTable, displaytable, Validate and Add A Record buttons everytime this fuctions is called to avoid duplicates
    const $requestContainer = $('#requestsContainer');
    $requestContainer.find('#requestsTable').html(` <tr>                            
                                                      <th class='text-center'>Date Requested</th>
                                                      <th class='text-center'>Request Status</th>
                                                      <th class='text-center'>View Details</th>                     
                                                    </tr>`);
    $requestContainer.find('#displaytable').html(`<tr>
                                                    <td colspan='3' align='center'><b>Requested information</b></td>
                                                  </tr>`);
    $requestContainer.find('#showButtons').html(` <div>
                                                    <button style='display:none'  type='button' class='btn btn-default'>Validate Identity</button>
                                                    <button style='display:none'  type='button' class='btn btn-default'>Add a record</button>
                                                  </div>`);
    $('#requestsContainer').append($requestContainer);
    $requestContainer.show();
      
    const citizenWalletAddress = document.getElementById("walletAddress").value;

    //Call the checkExists() function of the Issuer smart contract to check if the above wallet address (the value of walletAddress textfiled)  
    //belongs to a registered citizen and pass the result (array) to a variable
    const exists = await App.issuer.checkExists(citizenWalletAddress);
    if (exists === false) {
      alert("Wallet address is not registered yet!");
    } else {   
        //Call the requestLength() function of the Verifier smart contract and pass the result to a variable
        const requests = await App.verifier.requestLength(citizenWalletAddress);
        const requestLength = requests.toNumber();

        for(let i = 0; i < requestLength; i++){
          App.viewRequests(i, citizenWalletAddress);
        };
    };
  },

  viewRequests: async (reqIndex, citizenWalletAddress) =>  {
    //Load the requests, depending on the passed citizen's wallet address and request id, calling
    //the viewRequestCollapsed() function of the Verifier smart contract and pass the result (array) to a variable
    const request = await App.verifier.viewRequestCollapsed(citizenWalletAddress, reqIndex);
    const requestStatus = request[1].toNumber();
    const dateRequested = request[2];  

    //Insert HTML to requestsTable according to requestStatus 
    const requestsTable = document.getElementById("requestsTable");
    let requestStatusText = "";   

    if(requestStatus == 1) {
      requestStatusText = "Waiting Approval";
      var addToTable =  `<tr>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/mail-by-timer-32.png' alt='Waiting for approval'></td>
                          <td class='text-center'>&nbsp;</td>
                        </tr>`;                             
    } else if(requestStatus == 2){
      requestStatusText =  "Partially Approved";
      var addToTable = `<tr>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/marked-mail-32.png' alt='Approved or partially approved'></td>
                          <td class='text-center'><button type='button' class='btn btn-default' onClick='App.viewRequestDetails(\"${reqIndex}\")'>View Details</button></td>
                        </tr>`;
    } else if(requestStatus == 3){
      requestStatusText = "Approved";
      var addToTable = `<tr>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/marked-mail-32.png' alt='Approved or partially approved'></td>
                          <td class='text-center'><button type='button' class='btn btn-default' onClick='App.viewRequestDetails(\"${reqIndex}\")'>View Details</button></td>
                        </tr>`;
    } else if(requestStatus == 4){
      requestStatusText = "Rejected";
      var addToTable = `<tr>
                          <td class='text-center'>${dateRequested}</td>
                          <td class='text-center'>${requestStatusText}&nbsp;<img src='img/remove-mail-32.png' alt='Rejected'></td>
                        </tr>`;
    }
    requestsTable.insertAdjacentHTML('beforeend',addToTable);      
  },

  viewRequestDetails: async (reqIndex) => {
    //Create a new displayTable everytime this fuctions is called to avoid duplicates
    const $requestContainer = $('#requestsContainer');
    $requestContainer.find('#displaytable').html(`<table  class='table table-bordered'  id='displaytable'>
                                                    <tr>
                                                        <td colspan='3' class='text-center'><b>Requested information</b></td>
                                                    </tr>
                                                  </table>`);
    $('#requestsContainer').append($requestContainer);
    $requestContainer.show();    

    const citizenWalletAddress = document.getElementById("walletAddress").value; 

    //Load the details of the request, depending on the above wallet address (the value of walletAddress textfiled) and the request id that 
    //was passed to the function, calling the viewRequestExpanded() function of the Verifier smart contract and pass the result (array) to a variable
    const request =  await App.verifier.viewRequestExpanded(citizenWalletAddress, reqIndex); 
    const fullName = request[2].toNumber();
    const ssn = request[3].toNumber();
    const tin = request[4].toNumber();
    const dob = request[5].toNumber();
    const mobile = request[6].toNumber();
    const issuedBy = request[7].toNumber();
    const idHash = request[8].toNumber();

    //Call citizenList mapping of Citizen smart contract and pass the result (array) to a variable
    const citizen = await App.citizen.citizenList(citizenWalletAddress);
    const citizenHash = citizen[9];

    //Insert HTML to displayTable according to viewRequestExpanded() function results
    //If variable's value is bigger that 0 (i.e. its checkbox was checked by the verifier on the verifier.html) 
    //check if its value is exactly "1" or anything else and show the corresponding html 
    const requestsedInfoTable = document.getElementById("displaytable");

      if(fullName > 0){
          if(fullName == 1){
              listFullName = `<tr>
                                <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                                <td width='35%'><b>Full Name</b></td>
                                <td width='55%'>${citizen[1]}</td>
                              </tr>`;              
            }
            else {
              listFullName = `<tr>
                                <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                                <td width='35%'><b>Full Name</b></td>
                                <td width='55%'></td>
                              </tr>`;
                                
            }
            requestsedInfoTable.insertAdjacentHTML('beforeend',listFullName);
      }
      if(ssn > 0){
          if(ssn == 1){
            listSsn = `<tr>
                          <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                          <td width='35%'><b>Social Security Number</b></td>
                          <td width='55%'>${citizen[2]}</td>
                        </tr>`;           
          } else {
            listSsn = `<tr>
                          <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                          <td width='35%'><b>Social Security Number</b></td>
                          <td width='55%'></td>
                        </tr>`;
          }
          requestsedInfoTable.insertAdjacentHTML('beforeend',listSsn);
      }
      if(tin > 0){
          if(tin == 1){
            listTin = `<tr>
                          <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                          <td width='35%'><b>Tax Identification Number</b></td>
                          <td width='55%'>${citizen[3]}</td>
                        </tr>`;  
          } else {
            listTin = `<tr>
                          <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                          <td width='35%'><b>Tax Identification Number</b></td>
                          <td width='55%'></td>
                        </tr>`;
          }
          requestsedInfoTable.insertAdjacentHTML('beforeend',listTin);
      }
      if(dob > 0){
        if(dob == 1){
          listDOB = `<tr>
                      <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                      <td width='35%'><b>Date of Birth</b></td>
                      <td width='55%'>${citizen[4]}</td>
                    </tr>`;  
        } else {
          listDOB = `<tr>
                      <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                      <td width='35%'><b>Date of Birth</b></td>
                      <td width='55%'></td>
                    </tr>`;
        }
        requestsedInfoTable.insertAdjacentHTML('beforeend',listDOB);
      }
      if(mobile > 0){
        if(mobile == 1){
          listMobile = `<tr>
                          <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                          <td width='35%'><b>Mobile Number</b></td>
                          <td width='55%'>${citizen[5]}</td>
                        </tr>`;  
        } else {
          listMobile = `<tr>
                          <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                          <td width='35%'><b>Mobile Number</b></td>
                          <td width='55%'></td>
                        </tr>`;
        }
        requestsedInfoTable.insertAdjacentHTML('beforeend',listMobile);
      }
      if(issuedBy > 0){
        if(issuedBy == 1){
          listIssuedBy = `<tr>
                            <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                            <td width='35%'><b>ID Issuer</b></td>
                            <td width='55%'>${citizen[8]}</td>
                          </tr>`;  
        } else {
          listIssuedBy = `<tr>
                            <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                            <td width='35%'><b>ID Issuer</b></td>
                            <td width='55%'></td>
                          </tr>`;
        }
        requestsedInfoTable.insertAdjacentHTML('beforeend',listIssuedBy);
      }
      if(idHash > 0){
        if(idHash == 1){   
          listIdHash = `<tr>
                          <td class='text-center' width='10%'><img src='img/check.png' alt='Request is allowed'></td>
                          <td width='35%'><b>ID Hash</b></td>
                          <td width='55%'>${citizen[9]}</td>
                        </tr>`;  
        } else {
          listIdHash = `<tr>
                            <td class='text-center' width='10%'><img src='img/cancel.png' alt='Request is rejected'></td>
                            <td width='35%'><b>ID Hash</b></td>
                            <td width='55%'></td>
                          </tr>`;
        }
        requestsedInfoTable.insertAdjacentHTML('beforeend',listIdHash);
      }

      //Create new Validate Identity and Add a record buttons (with their display property set to none and then 
      //change it below using javascript) everytime this fuctions is called to avoid duplicates
      $requestContainer.find('#showButtons').html(`<div>
                                                    <button id='validate-btn' style='display:none'  type='button' class='btn btn-default' onclick='App.isIdValid(\"${citizenWalletAddress}\", \"${citizenHash}\")'>Validate Identity</button>
                                                    <button id='add-btn' style='display:none'  type='button' class='btn btn-default' data-toggle="modal" data-target="#modalAddRecord">Add a record</button>
                                                  </div>`);
      $('#requestsContainer').append($requestContainer);
      $requestContainer.show();    

      document.getElementById('validate-btn').style.display="inline-block";
      document.getElementById('add-btn').style.display="inline-block";
      document.getElementById('add-btn').disabled=true;
  },

  addRecord: async () => {
    //Call the getHospitalInfo() function of the Verifier smart contract and pass the result (array) to a variable
    const hospitaInfo = await App.verifier.getHospitalInfo(App.account)
    const hospitalName = hospitaInfo[1];
    const hospitalAddress = hospitaInfo[0];

    //Get the values of the input fields
    const citizenWalletAddress = $('#walletAddress').val();

    const recordName = $('#add-recordName').val();
    const treatmentType = $('#add-treatmentType').val();
    const treatmentTypeSelected = $('option:selected, add-treatmentType').index();
    let treatment = "";
    const dateAdded = new Date().toLocaleString();
    let doctorName = "";
    let nextAppointment = "";
    let recordStatus = 1; //Ongoing

    //If selected options is "Vaccination" get the values of the textfield else set variable values to "none" (citizenViewRecords.html)
    if(treatmentType != "Vaccination") {
      treatment = $('#add-treatment').val();
      doctorName = $('#add-doctorName').val();
    } else {
      treatment = "none";
      doctorName = "none";
    }

    //Check if next appointment checkbox is checked
    if(appointmentCheckbox.checked){
      const appointment = $('#add-nextAppointment').val();
      nextAppointment = appointment.replace('T', ', ')
    } else {
      nextAppointment = "none";
      recordStatus = 2; //Ended
    }

    //Add Record Modal Form Validation
    if((citizenWalletAddress == "") || (recordName == "") || (treatmentTypeSelected == 0) || (treatment == "") || (doctorName == "") || (nextAppointment == "")){
      alert("All fields must be filled out");
    } else if(/\d/.test(doctorName)){
      alert("Doctor's Name is not valid");
    } else {
      try {
          //Send a transaction to addRecord() function of Citizen smart contract 
          await App.citizen.addRecord(citizenWalletAddress, hospitalName, hospitalAddress, recordName, doctorName, treatmentType, treatment, dateAdded, nextAppointment, recordStatus, {from: App.account});
          
          //Call IsSuccessful event from Citizen smart contract and watch for its result
          const eventSuccess = App.citizen.IsSuccessful();
          eventSuccess.watch(function(error, res) {            
              if (!error && res.args.result === true) {
                alert("Success");
                window.location.reload();
              }
          }); 
      } catch {
        alert("Something went wrong");
      }     
    }    
  },

  isIdValid: async(citizenWalletAddress, idHash) => {
    //This function compares the id hash provided by the citizen on the current request with the id hash
    //that is stored in Issuer smart contract which is binded with the citizen's wallet address
    //If in any way the citizen made a change in the details of his/her id, then the hash will change 
    //and will not correspond to what the issuer has registered.

    //Αs long as the validity of the id hash remains unconfirmed the "Add a record" button is disabled 
    //and therefore no action is allowed

    //Call the checkValid() function of the Issuer smart contract and pass the result to a variable
    const isValid = await App.issuer.checkValid(citizenWalletAddress, idHash);

    if (isValid === true) {
      alert("Successful authentication! Identity hash is valid");
      const addBtn = document.getElementById('add-btn');
      addBtn.disabled = false;
    } else {
      alert("Could not authenticate! Identity hash is not valid");
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