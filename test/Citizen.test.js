const { assert } = require("chai");

const Citizen = artifacts.require('./Citizen.sol');

contract('Citizen', (accounts) => {
    before(async () => {
        this.Citizen = await Citizen.deployed()
    })

    it('Should successfully add a Citizen to citizenList mapping', async () => {
        const citizen = await this.Citizen.addCitizenInfo('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 'Christos Bandis', '12345678', '87654321', '20/02/1997', '6973979235', 'chr.bandis@gmail.com', 'Street 1', '0xD01c64e018Fe9C2D3409a7FB20D00C55960500b2');
        const AddressExists = citizen.logs[0].args;
        const IsSuccessful = citizen.logs[1].args;
        assert.equal(AddressExists.exists, false)
        assert.equal(IsSuccessful.result, true);
    });

    it('Should successfully set the transaction\'s hash for the newly added Citizen', async () => {
        const citizenHash = await this.Citizen.setIdHash('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', '0x7f2b8c5918f45276e78b5138ecd631eecf6ca7bd07e4e7892d894fe1fce7bf2a');
        //console.log(citizenHash);
    });

    it('Should successfully add a new hospital record', async () => {
        const addRecord = await this.Citizen.addRecord('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 'Hospital', '0x0d7d506f4485145C43A7D8f774C5394Bc704A759', 'Record1', 'Doctor1', 'Curative', 'treatment1', '28/03/2022', '24/04/2022', 1);
        const IsSuccessful = addRecord.logs[0].args;
        assert.equal(IsSuccessful.result, true);
    });

    it('Should successfully update a Citizen\'s record', async () => {
        const record = await this.Citizen.updateRecord('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 0, 'treatment2', '25/05/2022', 1);
        const IsSuccessful = record.logs[0].args;
        assert.equal(IsSuccessful.result, true);
    })

    it('Should successfully list a Citizen\'s record', async () => {
        const record = await this.Citizen.viewRecordExpanded('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 0);
        //console.log(record);
    })

    it('Should successfully end a Citizen\'s treatment', async () => {
        const record = await this.Citizen.endTreatment('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 0, 2);
        const IsSuccessful = record.logs[0].args;
        assert.equal(IsSuccessful.result, true);
    })
})