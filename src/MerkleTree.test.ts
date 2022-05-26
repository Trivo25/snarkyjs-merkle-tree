import { isReady, shutdown, Field, Poseidon } from 'snarkyjs';

import { MerklePath, MerkleTree, Options } from './MerkleTree';

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
        let tree = new MerkleTree([Field(0), Field(1)], options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(Poseidon.hash([Field(0), Field(1)]))
            .toBoolean()
        );
      });
      it('n = 4', () => {
        let tree = new MerkleTree(
          [Field(0), Field(1), Field(2), Field(3)],
          options
        );
        expect(
          tree
            .getMerkleRoot()!
            .equals(
              Poseidon.hash([
                Poseidon.hash([Field(0), Field(1)]),
                Poseidon.hash([Field(2), Field(3)]),
              ])
            )
            .toBoolean()
        );
      });
    });

    describe('odd', () => {
      it('n = 1', () => {
        let tree = new MerkleTree([Field(0)], options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(Poseidon.hash([Field(0)]))
            .toBoolean()
        );
      });
      it('n = 3', () => {
        let tree = new MerkleTree([Field(0), Field(1), Field(2)], options);
        expect(
          tree
            .getMerkleRoot()!
            .equals(
              Poseidon.hash([
                Poseidon.hash([Field(0), Field(1)]),
                Poseidon.hash([Field(3)]),
              ])
            )
            .toBoolean()
        );
      });
    });
  });

  describe('should produce and verify proofs correctly', () => {
    it('produce and verify proof', () => {
      let tree = new MerkleTree(
        [Field(0), Field(1), Field(3), Field(4)],
        options
      );
      let proof = tree.getProof(0);
      expect(proof.length === 2);
      MerkleTree.validateProof(
        proof,
        Poseidon.hash([Field(0)]),
        tree.getMerkleRoot()!
      );
    });
  });
});
