// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//import "./Ownable.sol";

contract Issuer {

    //Structs
    struct CitizenInfo {
        address walletAddress;
        bytes idHash;
    }

    struct HospitalInfo {
        address hospitalAddress;
        bytes hospitalHash;
    }

    //Mappings
    mapping(address => CitizenInfo) public citizenList;
    mapping(address => HospitalInfo) public hospitalList;    

    //Set Citizen and Hospital Info to the corresponding mappings
    function setCitizenInfo(address _walletAddress, bytes memory _idHash) public {
        citizenList[_walletAddress].walletAddress = _walletAddress;
        citizenList[_walletAddress].idHash = _idHash;
    }

    function setHospitalInfo(address _walletAddress, bytes memory _hospitalHash) public {
        hospitalList[_walletAddress].hospitalAddress = _walletAddress;
        hospitalList[_walletAddress].hospitalHash = _hospitalHash;
    }

    //Citizen's wallet address existence check
    function checkExists(address _walletAddress) public view returns(bool) {
        if (citizenList[_walletAddress].walletAddress == _walletAddress) {
            return true;
        } else {
            return false;
        }
    }

    //Citizen's id hash validation check
    function checkValid(address _walletAddress, bytes memory _idHash) public view returns(bool) {
        //Explicitly converting both hashes to bytes32 for comparison
        bytes32  citizenHash = keccak256(abi.encodePacked(citizenList[_walletAddress].idHash)); 
        bytes32  reqHash = keccak256(abi.encodePacked(_idHash));
        if (citizenHash == reqHash) {
            return true;
        } else {
            return false;
        }
    }
}