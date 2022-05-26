import { Field, isReady, Poseidon, shutdown } from 'snarkyjs';
import { MerkleTree, Options } from './MerkleTree.js';

const example = async () => {
  await isReady;

  let options: Options = {
    hashLeaves: true,
  };

  let rawData: Field[] = [Field(0), Field(1), Field(2), Field(3)];

  let tree = new MerkleTree(rawData, options);

  console.log(tree.getMerkleRoot()?.toString());

  tree.printProof(0);
  tree.printTree();
};
example();
