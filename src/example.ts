import { Field, isReady, Poseidon, shutdown } from 'snarkyjs';
import { MerkleTree, Options } from './MerkleTree.js';

const example = async () => {
  await isReady;

  let options: Options = {
    hashLeaves: true,
  };

  let rawData: Field[] = [Field(0), Field(1), Field(2), Field(3)];

  let tree = new MerkleTree(rawData, options);

  console.log('root: ' + tree.getMerkleRoot()?.toString());

  tree.printProof(0);
  tree.printTree();

  let isValid = MerkleTree.validateProof(
    tree.getProof(0),
    Poseidon.hash([rawData[0]]),
    tree.getMerkleRoot()!
  );
  console.log('proof valid?', isValid);
  shutdown();
};
example();
