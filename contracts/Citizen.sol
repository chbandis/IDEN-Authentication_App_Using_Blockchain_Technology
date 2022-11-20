// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//import "./Ownable.sol";

contract Citizen {

    //Structs
    struct CitizenInfo {
        address walletAddress;
        string fullName;
        uint ssn;
        uint tin;
        string dob;
        uint mobile;
        string email;       
        string homeAddress;
        address issuedBy;
        string idHash;
    }  

    struct MedicalRecord {
        string createdByName;
        address createdByAddress;
        string recordName;
        string doctorName;
        string treatmentType;
        string treatment;
        string dateAdded;
        string nextAppointment;
        uint treatmentStatus; //1 ongoing - 2 ended
    }

    //Mappings
    mapping(address => CitizenInfo) public citizenList;
    mapping(address => MedicalRecord[]) public records;

    //Events
    event IsSuccessful(bool result);
    event AddressExists(bool exists);

    //Citizen Functions
    function addCitizenInfo (address _walletAddress, string memory _fullName, uint _ssn, uint _tin, string memory _dob, uint _mobile, string memory _email, string memory _homeAddress, address _issuedBy) public {       
        if (citizenList[_walletAddress].walletAddress != _walletAddress) {
            emit AddressExists(false);
            citizenList[_walletAddress].walletAddress = _walletAddress;
            citizenList[_walletAddress].fullName = _fullName;
            citizenList[_walletAddress].ssn = _ssn;
            citizenList[_walletAddress].tin = _tin;
            citizenList[_walletAddress].dob = _dob;
            citizenList[_walletAddress].mobile = _mobile;
            citizenList[_walletAddress].email = _email;
            citizenList[_walletAddress].homeAddress = _homeAddress;
            citizenList[_walletAddress].issuedBy = _issuedBy;
            emit IsSuccessful(true); 
        } else {
            emit AddressExists(true);
        }       
    }

    function setIdHash(address _walletAddress, string memory _idHash) public {
        citizenList[_walletAddress].idHash = _idHash;        
    }

    //Record Functions
    function addRecord (address _walletAddress, string memory _createdByName, address _createdByAddress, string memory _recordName, string memory _doctorName, string memory _treatmentType, string memory _treatment, string memory _dateAdded, string memory _nextAppointment, uint _treatmentStatus) public {
        records[_walletAddress].push(MedicalRecord(_createdByName, _createdByAddress, _recordName, _doctorName, _treatmentType, _treatment, _dateAdded, _nextAppointment, _treatmentStatus));
        emit IsSuccessful(true);
    }

    function viewRecordExpanded(address _walletAddress, uint _recordId) public view returns(string memory, address, string memory, string memory, string memory, string memory, string memory, string memory, uint) {
        MedicalRecord memory thisRecord = records[_walletAddress][_recordId];
        return (thisRecord.createdByName, thisRecord.createdByAddress, thisRecord.recordName, thisRecord.doctorName, thisRecord.treatmentType, thisRecord.treatment, thisRecord.dateAdded, thisRecord.nextAppointment, thisRecord.treatmentStatus);
    }

    function viewRecordCollapsed(address _walletAddress, uint _recordId) public view returns (string memory, string memory, string memory, uint) {
        MedicalRecord memory thisRecord = records[_walletAddress][_recordId];
        return (thisRecord.recordName, thisRecord.treatmentType, thisRecord.dateAdded, thisRecord.treatmentStatus);
    }

    function recordLength(address _walletAddress) public view returns(uint) {
        return records[_walletAddress].length;
    }

    function updateRecord(address _walletAddress, uint _recordId, string memory _treatment, string memory _nextAppointment, uint _treatmentStatus) public {
        records[_walletAddress][_recordId].treatment = _treatment;
        records[_walletAddress][_recordId].nextAppointment = _nextAppointment;
        records[_walletAddress][_recordId].treatmentStatus = _treatmentStatus;
        emit IsSuccessful(true);
    }

    function endTreatment(address _walletAddress, uint _recordId, uint _treatmentStatus) public {
        records[_walletAddress][_recordId].treatmentStatus = _treatmentStatus;
        emit IsSuccessful(true);
    }
}