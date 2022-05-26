import { isReady, shutdown, Field, Poseidon } from 'snarkyjs';

import { MerkleTree, Options } from './MerkleTree';

describe('MerkleTree', () => {
  let options: Options = {
    hashLeaves: true,
  };

  beforeAll(async () => {
    await isReady;
  });

  afterAll(async () => {
    shutdown();
  });

  describe('should construct merkle trees correctly', () => {
    describe('even', () => {
      it('n = 2', () => {
        let rawData = [Field(0), Field(1)];
        let tree = new MerkleTree(rawData, options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(
              Poseidon.hash([
                Poseidon.hash([rawData[0]]),
                Poseidon.hash([rawData[1]]),
              ])
            )
            .toBoolean()
        ).toEqual(true);
      });
      it('n = 4', () => {
        let rawData = [Field(0), Field(1), Field(2), Field(3)];
        let tree = new MerkleTree(rawData, options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(
              Poseidon.hash([
                Poseidon.hash([
                  Poseidon.hash([rawData[0]]),
                  Poseidon.hash([rawData[1]]),
                ]),
                Poseidon.hash([
                  Poseidon.hash([rawData[2]]),
                  Poseidon.hash([rawData[3]]),
                ]),
              ])
            )
            .toBoolean()
        ).toEqual(true);
      });
    });

    describe('odd', () => {
      it('n = 1', () => {
        let rawData = [Field(0)];
        let tree = new MerkleTree(rawData, options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(Poseidon.hash([rawData[0]]))
            .toBoolean()
        ).toEqual(true);
      });
      it('n = 3', () => {
        let rawData = [Field(0), Field(1), Field(2)];
        let tree = new MerkleTree(rawData, options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(
              Poseidon.hash([
                Poseidon.hash([
                  Poseidon.hash([rawData[0]]),
                  Poseidon.hash([rawData[1]]),
                ]),
                Poseidon.hash([rawData[2]]),
              ])
            )
            .toBoolean()
        ).toEqual(true);
      });
    });
  });

  describe('should produce and verify proofs correctly', () => {
    it('produce and verify proof', () => {
      let rawData = [Field(0), Field(1), Field(2)];
      let tree = new MerkleTree(rawData, options);
      rawData.forEach((_, i) => {
        let proof = tree.getProof(i);
        expect(proof.length === 2);
        expect(
          MerkleTree.validateProof(
            proof,
            Poseidon.hash([rawData[i]]),
            tree.getMerkleRoot()!
          )
        ).toEqual(true);
      });
    });
  });
});
