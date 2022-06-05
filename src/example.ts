import { Field, isReady, Poseidon, shutdown } from 'snarkyjs';
import { MerkleTree, Options } from './MerkleTree.js';

const example = async () => {
  await isReady;

  let options: Options = {
    hashLeaves: true,
  };
  console.time('a');
  let rawData = [
    Field(0),
    Field(0),
    Field(0),
    Field(5),
    Field(0),
    Field(0),
    Field(0),
    Field(0),
  ];

  let tree1 = new MerkleTree(rawData, options);

  let rawData2 = [
    Field(0),
    Field(0),
    Field(0),
    Field(0),
    Field(0),
    Field(0),
    Field(0),
    Field(0),
  ];

  let tree2 = new MerkleTree(rawData2, options);

  tree2.update(Field(5), 3);

  console.log(
    tree1.getMerkleRoot()?.toString() === tree2.getMerkleRoot()?.toString()
  );
  shutdown();
};
example();
