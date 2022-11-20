//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//Contract used for registering an issuer's wallet address in the smart contract and restricting the excecution  
//of certain functions from the rest of the smart contracts with the help of the modifier "onlyIssuer"
contract Ownable {

    struct IssuerInfo {
        address issuerAddress;
        string issuerName;
    }
    
    mapping(address => IssuerInfo) public issuerList;
    
    constructor() {
        issuerList[0xD01c64e018Fe9C2D3409a7FB20D00C55960500b2].issuerAddress = 0xD01c64e018Fe9C2D3409a7FB20D00C55960500b2;
        issuerList[0xD01c64e018Fe9C2D3409a7FB20D00C55960500b2].issuerName = "Office1";
    }
    
    modifier onlyIssuer() {
        require(issuerList[msg.sender].issuerAddress == msg.sender, "You are not allowed");
        _;
    }
}