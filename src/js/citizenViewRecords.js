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
    web3.eth.defaultAccount=web3.eth.accounts[0]
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
        // Render Records
        await App.renderRecords();
    };
  },

  renderRecords: async () => {
    //Call the recordLength() function of the Citizen smart contract and pass the result to a variable
    const records = await App.citizen.recordLength(App.account);
    const recordLength = records.toNumber();

    for(let i = 0; i < recordLength; i++){
      App.viewRecords(i);
    };     
  },

  viewRecords: async (recordId) => {
    //Load the records, depending on the connected citizen's wallet address and the record id, calling
    //the viewRecordCollapsed() function of the Citizen smart contract and pass the result (array) to a variable
    const record = await App.citizen.viewRecordCollapsed(App.account, recordId);

    //Pass the values of the array to variables
    const recordName = record[0];
    const treatmentType = record[1];
    const dateCreated = record[2];
    const treatmentStatus = record[3].toNumber();

    //Insert HTML to recordsTable according to treatmentStatusText 
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
    $recordsContainer.find('#displaytable').html(`<table  class='table table-bordered'  id='displaytable'>
                                                    <tr>
                                                      <td colspan='2' align='center'><b>Record Details</b></td>
                                                    </tr>
                                                  </table>`);
    $('#recordsContainer').append($recordsContainer);
    $recordsContainer.show();   

    //Load the details of the record, depending on the connected citizen's wallet address and the record id that was passed to the function, 
    //calling the viewRecordExpanded() function of the Citizen smart contract and pass the result (array) to a variable
    const record =  await App.citizen.viewRecordExpanded(App.account, recordId); 

    const createdByName = record[0];
    const createdByAddress = record[1];
    const recordName = record[2];
    const doctorsName = record[3];
    const treatmentType = record[4];
    const treatment = record[5];
    const dateScheduled = record[6];
    const nextAppointment = record[7];
    const treatmentStatus = record[8].toNumber();

    //Append the createdByName and createdByAddress values to displayTableParent and show the table
    const $recordTable = $('#displaytableParent');        
    $recordTable.find('#createdByName').html(createdByName);
    $recordTable.find('#createdByAddress').html(createdByAddress);
    $('#displaytableParent').append($recordTable);
    $recordTable.show();

    //Insert HTML to displayTable according to viewRecordExpanded() function results
    //If variable's value is not "none" (i.e. its value was not empty by the time this record was created 
    //on the verifierViewRequests.html) show the corresponding html 
    const recordInfoTable = document.getElementById("displaytable");

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