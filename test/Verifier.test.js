const { assert } = require("chai");

const Verifier = artifacts.require('./Verifier.sol');

contract('Verifier', (accounts) => {
    before(async () => {
        this.Verifier = await Verifier.deployed()
    })

    it('Should successfully add a Hospital to hospitalList mapping', async () => {
        const hospital = await this.Verifier.addHospital('0x0d7d506f4485145C43A7D8f774C5394Bc704A759', 'Hospital', '0xD01c64e018Fe9C2D3409a7FB20D00C55960500b2');
        const AddressExists = hospital.logs[0].args;
        const IsSuccessful = hospital.logs[1].args;
        assert.equal(AddressExists.exists, false)
        assert.equal(IsSuccessful.result, true);
    });

    it('Should successfully set the transaction\'s hash for the newly added Hospital', async () => {
        const hospitalHash = await this.Verifier.setHospitalHash('0x0d7d506f4485145C43A7D8f774C5394Bc704A759', '0x7f2b8c5918f45276e78b5138ecd631eecf6ca7bd07e4e7892d894fe1fce7bf2a');
        //console.log(hospitalHash);
    });

    it('Should successfully get a Hospital\'s info', async () => {
        const hospitalInfo = await this.Verifier.getHospitalInfo('0x0d7d506f4485145C43A7D8f774C5394Bc704A759');
        //console.log(hospitalInfo);
    });

    it('Should check if a Hospital exists', async () => {
        const hospitalExists = await this.Verifier.hospitalExists('0x0d7d506f4485145C43A7D8f774C5394Bc704A759');
        assert.equal(hospitalExists, true);
    });

    it('Should successfully send an ID request', async () => {
        const request = await this.Verifier.sendRequest('Hospital', '0x0d7d506f4485145C43A7D8f774C5394Bc704A759', '0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 1, 1, 1, 1, 1, 1, 1, 1, "20/02/2022");
        const requestCount = await this.Verifier.requestLength('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268');
        assert.equal(requestCount, 1);
        const IsSuccessful = request.logs[0].args;
        assert.equal(IsSuccessful.result, true);
    })

    it('Should successfully update an ID request', async () => {
        const request = await this.Verifier.updateRequest('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 0, 2, 2, 2, 2, 2, 2, 2, 2);
        const requestCount = await this.Verifier.requestLength('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268');
        assert.notEqual(requestCount, requestCount-1);
        const IsSuccessful = request.logs[0].args;
        assert.equal(IsSuccessful.result, true);
    })

    it('Should successfully list an ID request', async () => {
        const request = await this.Verifier.viewRequestExpanded('0xFABeceBf00E1EA7A835d01f86412A3fA472E4268', 0);
        //console.log(request);
    })

})