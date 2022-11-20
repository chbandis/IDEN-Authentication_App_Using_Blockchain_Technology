const { assert } = require("chai");

const Issuer = artifacts.require('./Issuer.sol');

contract('Issuer', (accounts) => {
    before(async () => {
        this.Issuer = await Issuer.deployed()
    })

    it('Should successfully add a Citizen to citizenList mapping', async () => {
        const citizen = await this.Issuer.setCitizenInfo('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', '0x7f2b8c5918f45276e78b5138ecd631eecf6ca7bd07e4e7892d894fe1fce7bf2a');
        //console.log(citizen);
    });

    it('Should successfully add a Hospital to hospitalList mapping', async () => {
        const hospital = await this.Issuer.setHospitalInfo('0x0d7d506f4485145C43A7D8f774C5394Bc704A759', '0x7f2b8c5918f45276e78b5138ecd631eecf6ca7bd07e4e7892d894fe1fce7bf2a');
        //console.log(hospital);
    });

    it('Should check if a Citizen exists', async () => {
        const citizenExists = await this.Issuer.checkExists('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268');
        assert.equal(citizenExists, true);
    });

    it('Should check if a Citizen\'s hash is valid', async () => {
        const isValid = await this.Issuer.checkValid('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', '0x7f2b8c5918f45276e78b5138ecd631eecf6ca7bd07e4e7892d894fe1fce7bf2a');
        assert.equal(isValid, true);
    });
})