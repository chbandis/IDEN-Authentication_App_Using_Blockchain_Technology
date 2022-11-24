# IDEN (Identification Eden) - Authentication App Using Blockchain Technology (Ethereum - Solidity)
IDEN is an identification system that makes use of Blockchain technology. It was developed on the Ethereum Blockchain and takes advantage of any features implied with it. It has three roles, the "Issuer", the "Citizen" and the "Verifier", and benefits from smart contracts to carry out its functions. The issuer is responsible for entering the identity details of the citizen and the verifier on the Blockchain. The data is entered through a form in the application environment of the issuer and then stored in the wallet corresponding to the address provided by the citizen or verifier. Then, the citizen from the respective environment, can check his data and respond to incoming requests to share his data. Finally, the verifier has the ability, through his own environment, to request the data of a citizen, confirm their ownership and perform the desired actions. In terms of security, it inherits all the features of smart contracts, so all data is encrypted, with constant checks to avoid possible errors.

Below are some screenshots of the application's user interface:

<img width="865" alt="homepage" src="https://user-images.githubusercontent.com/91207835/203648840-3dc6e79b-9fb7-44b6-b9e1-0379d72fddde.png">

![IssuerUI](https://user-images.githubusercontent.com/91207835/203648754-30e5e1be-f0e6-4062-a9c4-d1495aaf66bd.png)

![IssuerCitizen](https://user-images.githubusercontent.com/91207835/203648921-6edef2a7-522f-4798-bdff-2679cef07f3d.png)

![CitizenUI](https://user-images.githubusercontent.com/91207835/203649006-57b70cd5-ffb9-4b86-9bf4-495cab522ea6.png)

![HospitalUI_CitizenIDRequest](https://user-images.githubusercontent.com/91207835/203649062-cf528df3-e120-4045-992d-1fc6a8cdc3b4.png)

![CitizenIDRequestView](https://user-images.githubusercontent.com/91207835/203649139-8467e964-e106-4ee5-a70e-d995ace1dba7.png)

![HospitalRequestResponse](https://user-images.githubusercontent.com/91207835/203649171-54727c88-de0e-482e-92da-374649c7ae46.png)

![AddRecordUI](https://user-images.githubusercontent.com/91207835/203649297-361364fe-d941-4377-a78c-7bc2388cc709.png)

![UseCaseStoryboard](https://user-images.githubusercontent.com/91207835/203861545-ddd0b306-a031-4770-826c-f083c54d731f.png)

**Running the Application**
- [Node.js](https://nodejs.org/en/) should be installed (Python and Visual Studio Build Tools are required).
- [Ganache](https://github.com/trufflesuite/ganache-ui) should be installed.
- [Metamask](https://metamask.io/download/) should be installed.
- The npm install command must be run to install the necessary modules (Duration 2-5 minutes @ ~30Mbps).
- The Port Number of Ganache must be 8545 and the Network ID 1337.
- The Show test networks option must be enabled in Metamask and the active network must be Localhost 8545.
- Application url (after running the local server) is http://localhost:3000

To run the application it is necessary to import three of the ten accounts generated by Ganache during its execution. They can be entered via the private key located by clicking the key icon to the right of each address (see image below).

![PrivateKeyGanache](https://user-images.githubusercontent.com/91207835/203859718-b736fc37-38f9-477e-b31b-58828bb6e269.png)

Next, we open a powershell window inside the application folder and type the following command:
```
node_modules/.bin/truffle migrate --reset
```

At the end the powershell window should look like this:

![TruffleMigrateCommandResults](https://user-images.githubusercontent.com/91207835/203860095-ca97f6a2-6e7d-4460-a893-8d7aeffc880e.png)

To conclude, we run the `npm run dev command` inside the application folder to run the local server ([lite-server](https://github.com/johnpapa/lite-server)). The result should look like this:

![Lite-serverCommand](https://user-images.githubusercontent.com/91207835/203860364-1613a15d-c379-43c1-b406-3d0946de022f.png)

*The versions of the tools used are: Node.js v16.15.0 - npm v8.5.5 - Ganache v2.5.4. *
