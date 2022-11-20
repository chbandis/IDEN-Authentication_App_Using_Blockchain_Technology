const { assert } = require("chai");

const Ownable = artifacts.require('./Ownable.sol');
const Issuer = artifacts.require('./Issuer.sol');
const Citizen = artifacts.require('./Citizen.sol');
const Verifier = artifacts.require('./Verifier.sol');

    contract('Ownable', (accounts) => {
        before(async () => {
            this.Ownable = await Ownable.deployed()
        })

        it('Contract "Ownable" successfully deployed', async () => {
            const address = await this.Ownable.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    contract('Issuer', (accounts) => {
        before(async () => {
            this.Issuer = await Issuer.deployed()
        })

        it('Contract "Issuer" successfully deployed', async () => {
            const address = await this.Issuer.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    contract('Citizen', (accounts) => {
        before(async () => {
            this.Citizen = await Citizen.deployed()
        })

        it('Contract "Citizen" successfully deployed', async () => {
            const address = await this.Citizen.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })

    contract('Verifier', (accounts) => {
        before(async () => {
            this.Verifier = await Verifier.deployed()
        })

        it('Contract "Verifier" successfully deployed', async () => {
            const address = await this.Verifier.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    })