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

  renderRecords: async () => {
    //Create a new recordsTable, displayTable, Update Record and End Treatment buttons everytime this fuctions is called to avoid duplicates
    const $recordsContainer = $('#recordsContainer');
    $recordsContainer.find('#recordsTable').html(`<tr>                            
                                                    <th class='text-center'>Record Name</th>
                                                    <th class='text-center'>Treatment Type</th>
                                                    <th class='text-center'>Date Scheduled</th>
                                                    <th class='text-center'>Treatment Status</th>  
                                                    <th class='text-center'>View Details</th>                    
                                                  </tr> `);
    $recordsContainer.find('#displayTable').html(`<tr>
                                                    <td colspan='2' align='center'><b>Record Details</b></td>
                                                  </tr>`);
    $recordsContainer.find('#showButtons').html(`<div>
                                                    <button style='display:none'  type='button' class='btn btn-default'>Update Record</button>
                                                    <button style='display:none'  type='button' class='btn btn-default'>End Treatment</button>                                                    
                                                  </div>`);
    $('#recordsContainer').append($recordsContainer);
    $recordsContainer.show();    

    const citizenWalletAddress = document.getElementById("walletAddress").value;

    //Call the checkExists() function of the Issuer smart contract to check if the above wallet address (the value of walletAddress textfiled)  
    //belongs to a registered citizen and pass the result (array) to a variable
    const exists = await App.issuer.checkExists(citizenWalletAddress);
    if (exists === false) {
      alert("Wallet address is not registered yet!");
    } else {   
      //Call the recordLength() function of the Citizen smart contract and pass the result to a variable
      const records = await App.citizen.recordLength(citizenWalletAddress);
      const recordLength = records.toNumber();

      for(let i = 0; i < recordLength; i++){
        App.viewRecords(i, citizenWalletAddress);
      };
    };
  },

  viewRecords: async (recordId, citizenWalletAddress) =>  {
    //Load the records, depending on the passed citizen's wallet address and record id, calling
    //the viewRecordCollapsed() function of the Citizen smart contract and pass the result (array) to a variable
    const record = await App.citizen.viewRecordCollapsed(citizenWalletAddress, recordId);
    const recordName = record[0];
    const treatmentType = record[1];
    const dateCreated = record[2];
    const treatmentStatus = record[3].toNumber();

    //Insert HTML to recordsTable according to treatmentStatus 
    const recordsTable = document.getElementById("recordsTable");
    let treatmentStatusText = "";     

    if(treatmentStatus == 1) {
      treatmentStatusText = "Ongoing";
      var addToTable =  `<tr>
                            <td class='text-center'>${recordName}</td>
                            <td class='text-center'>${treatmentType}</td>
                            <td class='text-center'>${dateCreated}</td>
                            <td class='text-center'>${treatmentStatusText}&nbsp;<img src='img/calendar.png' alt='Ongoing'></td>                            
                            <td align='center'><button type='button' class='btn btn-default' onClick='App.viewRecordDetails(\"${recordId}\")'>View Details</button></td>
                        </tr>`; 
                        
    } else if(treatmentStatus == 2){
      treatmentStatusText =  "Ended";
      var addToTable = `<tr>
                          <td class='text-center'>${recordName}</td>
                          <td class='text-center'>${treatmentType}</td>
                          <td class='text-center'>${dateCreated}</td>
                          <td class='text-center'>${treatmentStatusText}&nbsp;<img src='img/calendar-canceled.png' alt='Ended'></td>                            
                          <td align='center'><button type='button' class='btn btn-default' onClick='App.viewRecordDetails(\"${recordId}\")'>View Details</button></td>
                        </tr>`;
    } 
    recordsTable.insertAdjacentHTML('beforeend',addToTable);      
  },

  viewRecordDetails: async (recordId) => {
    //Create a new displayTable everytime this fuctions is called to avoid duplicates
    const $recordsContainer = $('#recordsContainer');
    $recordsContainer.find('#displayTable').html(`<table  class='table table-bordered'  id='displayTable'>
                                                    <tr>
                                                      <td colspan='2' align='center'><b>Record Details</b></td>
                                                    </tr>
                                                  </table>`);
    $('#recordsContainer').append($recordsContainer);
    $recordsContainer.show();      

    const citizenWalletAddress = $('#walletAddress').val();

    //Load the details of the record, depending on the above wallet address (the value of walletAddress textfiled) and the record id  
    //that was passed to the function, calling the viewRecordExpanded() function of the Citizen smart contract and pass the result (array) to a variable
    const record =  await App.citizen.viewRecordExpanded(citizenWalletAddress, recordId);
    const recordName = record[2];
    const doctorsName = record[3];
    const treatmentType = record[4];
    const treatment = record[5];
    const dateScheduled = record[6];
    const nextAppointment = record[7];
    const treatmentStatus = record[8].toNumber();

    //Insert HTML to displayTable according to viewRecordExpanded() function results
    //If variable's value is not "none" (i.e. its value was not empty by the time this record was created 
    //on the verifierViewRequests.html) show the corresponding html 
    const recordInfoTable = document.getElementById("displayTable");

    if(recordName != "none"){
      const listrecordName = `<tr>
                                 <td><b>Record Name</b></td>
                                 <td>${recordName}</td>
                               </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listrecordName);
    }
    if(doctorsName != "none"){
      const listDoctorsName = `<tr>
                                   <td><b>Doctor's Name</b></td>
                                   <td>${doctorsName}</td>
                               </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listDoctorsName);
    }
    if(treatmentType != "none"){
      const listTreatmentType = `<tr>
                                   <td><b>Treatment Type</b></td>
                                   <td>${treatmentType}</td>
                                 </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listTreatmentType);
    }
    if(treatment != "none"){
      const listTreatment = `<tr>
                               <td><b>Treatment</b></td>
                               <td>${treatment}</td>
                             </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listTreatment);
    }
    if(dateScheduled != "none"){
      const listDateScheduled = `<tr>
                                   <td><b>Date Scheduled</b></td>
                                   <td>${dateScheduled}</td>
                                 </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listDateScheduled);
    }
    if(nextAppointment != "none"){
      const listNextAppointment = `<tr>
                                     <td><b>Next Appointment</b></td>
                                     <td>${nextAppointment}</td>
                                   </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listNextAppointment);
    }
    if(treatmentStatus == 1){
      const listTreatmentStatus = `<tr>
                                     <td><b>Treatment Status</b></td>
                                     <td>Ongoing</td>
                                   </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listTreatmentStatus);
    } else if (treatmentStatus == 2){
      const listTreatmentStatus = `<tr>
                                     <td><b>Treatment Status</b></td>
                                     <td>Ended</td>
                                   </tr>`;
      recordInfoTable.insertAdjacentHTML('beforeend',listTreatmentStatus);
    }

    //Create new Update Record and End Treatment buttons (with their display property set to none and then 
    //change it below using javascript depending on the treament status) everytime this fuctions is called to avoid duplicates
    $recordsContainer.find('#showButtons').html(`<div>
                                                     <button id='update-btn' style='display:none'  type='button' class='btn btn-default' data-toggle="modal" data-target="#modalUpdateRecord">Update Record</button>
                                                     <button id='end-btn' style='display:none'  type='button' class='btn btn-default' onclick='App.endTreatment(\"${citizenWalletAddress}\", \"${recordId}\")'>End Treatment</button>                                                    
                                                 </div>`);
    $('#recordsContainer').append($recordsContainer);
    $recordsContainer.show();    

    if(treatmentStatus == 2){
        document.getElementById('update-btn').style.display="none";
        document.getElementById('end-btn').style.display="none";
    } else {
        document.getElementById('update-btn').style.display="inline-block";
        document.getElementById('end-btn').style.display="inline-block";
    }

    //Set display property of updatedTreatment textarea and its label to none when the record's treatmentType is "Vaccination"
    if(treatmentType == "Vaccination"){
      document.getElementById('updatedTreatmentLabel').style.display = "none";
      document.getElementById('updatedTreatment').style.display = "none";
    } else {
      document.getElementById('updatedTreatmentLabel').style.display = "block";
      document.getElementById('updatedTreatment').style.display = "block";
    }

    //Create new Close and Update Record buttons (with their display property set to none and then 
    //change it below using javascript) everytime this fuctions is called to avoid duplicates on Update Record Modal
    const modal = document.getElementById("modal-footer");
    const footerButtons = `<button type='button' id='closeBtn' style='display:none' class='btn btn-secondary' data-dismiss='modal'>Close</button>
                           <button type='button' id='updateBtn' style='display:none' class='btn btn-primary' onclick='App.updateRecord(\"${recordId}\")'>Update Record</button>`;
    modal.insertAdjacentHTML('beforeend',footerButtons);

    document.getElementById('closeBtn').style.display="inline-block";
    document.getElementById('updateBtn').style.display="inline-block";      
  },

  updateRecord: async(recordId) => {   
    //Get the values of the input fields 
    const citizenWalletAddress = $('#walletAddress').val();
    const treatment = $('#updatedTreatment').val();

    let updatedTreatment = "";
    let nextAppointment = "";
    let updatedTreatmentStatus = 1; //Ongoing

    //If treatment variable's value is empty (i.e. updatedTreatment textarea is empty - record's treatmentType is "Vaccination")  
    //set updatedTreatment variable's value to "none"
    if (treatment == ""){
      updatedTreatment = "none";
    } else {
      updatedTreatment = treatment;
    }

    //Check if next appointment checkbox is checked
    if(appointmentCheckbox.checked){
      const appointment = document.getElementById('add-nextAppointment').value;
      nextAppointment = appointment.replace('T', ', ')
    } else {
      nextAppointment = "none";
      updatedTreatmentStatus = 2; //Ended
    }

    try {
      //Send a transaction to updateRecord() function of Citizen smart contract 
      await App.citizen.updateRecord(citizenWalletAddress, recordId, updatedTreatment, nextAppointment, updatedTreatmentStatus, {from: App.account});

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
  },

  endTreatment: async(citizenWalletAddress, recordId) => {
    //Set treatmentStatus value to 2 - Ended
    const treatmentStatus = 2; //Ended

    try {
      //Send a transaction to endTreatment() function of Citizen smart contract 
      await App.citizen.endTreatment(citizenWalletAddress, recordId, treatmentStatus, {from: App.account});

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