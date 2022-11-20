// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//import "./Ownable.sol";

contract Verifier {

    //Structs
    struct Hospital {
        address hospitalAddress;
        string hospitalName;
        address issuer;
        bytes hospitalHash;
    }

    struct Request {
        string requestedByName;
        address requestedByAddress;
        uint citizenFullName;
        uint citizenSsn;
        uint citizenTin;
        uint citizenDob;
        uint citizenMobile;
        uint citizenIdIssuedBy;
        uint citizenIdHash;
        uint requestStatus; //1 Waiting Approval - 2 Partially Approved - 3 Approved - 4 Rejected
        string dateRequested;
    }

    //Mappings
    mapping(address => Hospital) public hospitalList;
    mapping(address => Request[]) public requests;
    mapping(address => uint) public requestsWaiting;

    //Events
    event IsSuccessful(bool result);
    event AddressExists(bool exists);
    
    //Hospital Functions
    function addHospital(address _hospitalAddress, string memory _hospitalName, address _issuer) public {
        if (hospitalList[_hospitalAddress].hospitalAddress != _hospitalAddress) {
            emit AddressExists(false);
            hospitalList[_hospitalAddress].hospitalAddress = _hospitalAddress;
            hospitalList[_hospitalAddress].hospitalName = _hospitalName;
            hospitalList[_hospitalAddress].issuer = _issuer;
            emit IsSuccessful(true); 
        } else {
            emit AddressExists(true);
        }      
    }

    function setHospitalHash(address _hospitalAddress, bytes memory _hospitalHash) public {
        hospitalList[_hospitalAddress].hospitalHash = _hospitalHash;
    }

    function getHospitalInfo(address  _hospitalAddress) public view returns(address, string memory) {
        Hospital memory thisHospital = hospitalList[_hospitalAddress];
        return (thisHospital.hospitalAddress, thisHospital.hospitalName);
    }

    function hospitalExists(address _hospitalAddress) public view returns(bool) {
        if(hospitalList[_hospitalAddress].hospitalAddress == _hospitalAddress) {
            return true;
        } else {
            return false;
        }
    }

    //Request Functions
    function sendRequest(string memory _requestedByName, address _requestedByAddress, address _walletAddress, uint _citizenFullName, uint _citizenSsn, uint _citizenTin, uint _citizenDob, uint _citizenMobile, uint _citizenIdIssuedBy, uint _citizenIdHash, uint _requestStatus, string memory _dateRequested) public {
        requests[_walletAddress].push(Request(_requestedByName, _requestedByAddress, _citizenFullName, _citizenSsn, _citizenTin, _citizenDob, _citizenMobile, _citizenIdIssuedBy, _citizenIdHash, _requestStatus, _dateRequested));
        emit IsSuccessful(true);
        requestsWaiting[_walletAddress] += 1;
    }

    function viewRequestExpanded(address _walletAddress, uint _requestNo) public view  returns (string memory, address, uint, uint, uint, uint, uint, uint, uint, uint) {
        Request memory thisRequest = requests[_walletAddress][_requestNo];
        return (thisRequest.requestedByName, thisRequest.requestedByAddress, thisRequest.citizenFullName, thisRequest.citizenSsn, thisRequest.citizenTin, thisRequest.citizenDob, thisRequest.citizenMobile, thisRequest.citizenIdIssuedBy, thisRequest.citizenIdHash, thisRequest.requestStatus);
    }

    function viewRequestCollapsed(address _walletAddress, uint _requestNo) public view returns (string memory, uint, string memory) {
        Request memory thisRequest = requests[_walletAddress][_requestNo];
        return (thisRequest.requestedByName, thisRequest.requestStatus, thisRequest.dateRequested);
    }

    function requestLength(address _walletAddress) public view returns(uint) {
        return requests[_walletAddress].length;
    }

    function updateRequest(address _walletAddress, uint _requestNo, uint _citizenFullName, uint _citizenSsn, uint _citizenTin, uint _citizenDob, uint _citizenMobile, uint _citizenIdIssuedBy, uint _citizenIdHash, uint _requestStatus) public {
        requests[_walletAddress][_requestNo].citizenFullName = _citizenFullName;
        requests[_walletAddress][_requestNo].citizenSsn = _citizenSsn;
        requests[_walletAddress][_requestNo].citizenTin = _citizenTin;
        requests[_walletAddress][_requestNo].citizenDob = _citizenDob;
        requests[_walletAddress][_requestNo].citizenMobile = _citizenMobile;
        requests[_walletAddress][_requestNo].citizenIdIssuedBy = _citizenIdIssuedBy;
        requests[_walletAddress][_requestNo].citizenIdHash = _citizenIdHash;
        requests[_walletAddress][_requestNo].requestStatus = _requestStatus;
        emit IsSuccessful(true);
        requestsWaiting[_walletAddress] -= 1;
    }
}