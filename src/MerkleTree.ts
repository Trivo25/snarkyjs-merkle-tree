import { Field, Circuit, Poseidon } from 'snarkyjs';

export { MerkleTree };
export type { MerklePath, Options };

/**
 * A {@link BinaryTree} represents the underlying data structure used in Merkle Trees.
 * It stores the trees leaves and the nodes, which are stored in a matrix.
 */
interface BinaryTree {
  leaves: Array<Field>;
  levels: Array<Array<Field>>;
}

/**
 * A {@link MerklePath} has the following structure:
 * direction: Field - Direction of the node, Field(0) for left, Field(1) for right
 * hash: Field - Hash of the node
 * With a list of MerklePathElements you can recreate the merkle root for a specific leaf
 */
type MerklePath = Array<{
  direction: Field;
  hash: Field;
}>;
/**
 * Option interface for a Merkle Tree
 */
interface Options {
  hashLeaves: boolean;
}

/**
 * A {@link MerkleTree} is a {@link BinaryTree} which aggregates hashes of the underlying data. See [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree)
 *
 */
class MerkleTree {
  private tree: BinaryTree;
  private options: Options;

  /**
   * Builds a merkle tree based on a list of given leaves
   * @param {Array<Field>} leaves leaves filled with data
   * @param {Options} options that can define the structure of the merkle tree
   * @return returns a {@link MerkleTree}
   */
  constructor(leaves: Array<Field>, options: Options) {
    this.tree = {
      leaves: [],
      levels: [],
    };
    this.options = options;
    this.appendLeaves(leaves, this.options.hashLeaves);
  }

  /**
   * Static function to validate a merkle path
   * @param {MerklePath} merklePath Merkle path leading to the root of the tree
   * @param {Field} leafHash Hash of element that needs verification
   * @param {Field} merkleRoot Root of the merkle tree
   * @returns {boolean} true when the merkle path matches the merkle root
   */
  static validateProof(
    merklePath: MerklePath,
    leafHash: Field,
    merkleRoot: Field
  ): boolean {
    let proofHash: Field = leafHash;

    for (let x = 0; x < merklePath.length; x++) {
      proofHash = Circuit.if(
        merklePath[x].direction.equals(Field(1)),
        Poseidon.hash([merklePath[x].hash, proofHash]),
        proofHash
      );
      proofHash = Circuit.if(
        merklePath[x].direction.equals(Field(0)),
        Poseidon.hash([proofHash, merklePath[x].hash]),
        proofHash
      );
    }

    return proofHash.equals(merkleRoot).toBoolean();
  }

  /**
   * Returns the merkle proof
   * @returns {Field | undefined} Merkle root, if not undefined
   */
  getMerkleRoot(): Field | undefined {
    if (this.tree.levels.length === 0) {
      return undefined;
    }
    return this.tree.levels[0][0];
  }

  /**
   * Returns a merkle path of an element at a given index
   * @param {number} index of element
   * @returns {MerklePath | undefined} merkle path or undefined
   */
  getProof(index: number): MerklePath {
    let currentRowIndex: number = this.tree.levels.length - 1;
    if (index < 0 || index > this.tree.levels[currentRowIndex].length - 1) {
      return []; // the index it out of the bounds of the leaf array
    }

    let path: MerklePath = [];

    for (let x = currentRowIndex; x > 0; x--) {
      let currentLevelNodeCount: number = this.tree.levels[x].length;
      // skip if this is an odd end node
      if (
        index === currentLevelNodeCount - 1 &&
        currentLevelNodeCount % 2 === 1
      ) {
        index = Math.floor(index / 2);
        continue;
      }

      // determine the sibling for the current index and get its hash value
      // if the node is even, the sibling has to be on the right of it
      // if the node is odd, the sibling has to be on the left of it
      let isEvenNode: boolean = index % 2 === 0;
      let siblingIndex: number = isEvenNode ? index + 1 : index - 1;

      path.push({
        direction: isEvenNode ? Field(0) : Field(1),
        hash: this.tree.levels[x][siblingIndex],
      });

      index = Math.floor(index / 2); // set index to the parent index
    }

    return path;
  }

  /**
   * Finds the index of a given element
   * @param {number} element to find
   * @returns {number | undefined} index or undefined
   */
  getIndex(element: Field): number | undefined {
    let result = undefined;
    this.tree.leaves.forEach((el, i) => {
      if (el.equals(element).toBoolean()) {
        result = i;
        return;
      }
    });

    return result;
  }

  /**
   * Appends new leaves of data to an existing Merkle Tree
   * @param {Array<Field>} leaves leaves filled with data
   * @param {boolean} hash if true elements in the array will be hased using Poseidon, if false they will be inserted directly
   */
  appendLeaves(leaves: Array<Field>, hash: boolean = true) {
    leaves.forEach((value: Field) => {
      this.tree.leaves.push(hash ? Poseidon.hash([value]) : value);
    });

    this.makeTree();
  }

  /**
   * (Re)builds the {@link MerkleTree}'s levels based on pre-initialized leaves
   */
  makeTree() {
    let leafCount: number = this.tree.leaves.length;
    if (leafCount > 0) {
      this.tree.levels = [];
      this.tree.levels.unshift(this.tree.leaves);
      while (this.tree.levels[0].length > 1) {
        this.tree.levels.unshift(this.calculateNextLevel());
      }
    }
  }

  /**
   * Calculates new levels of the merkle tree structure, helper function
   * @returns {Array<Field>} Level of the merkle tree
   */
  private calculateNextLevel(): Array<Field> {
    let nodes: Array<Field> = [];
    let topLevel: Array<Field> = this.tree.levels[0];
    let topLevelCount: number = topLevel.length;
    for (let x = 0; x < topLevelCount; x += 2) {
      if (x + 1 <= topLevelCount - 1) {
        // concatenate and hash the pair, add to the next level array, doubleHash if requested
        nodes.push(Poseidon.hash([topLevel[x], topLevel[x + 1]]));
      } else {
        // this is an odd ending node, promote up to the next level by itself
        nodes.push(topLevel[x]);
      }
    }
    return nodes;
  }

  private clear() {
    this.tree = {
      leaves: [],
      levels: [],
    };
  }

  printTree(): void {
    console.log('printing tree from top (root) to bottom (leaves)');
    this.tree.levels.forEach((level, index) => {
      console.log(`- - - level ${index} ${index === 0 ? 'root' : ''} - - - `);
      level.forEach((entry, i) => {
        console.log(`${i}: ${entry.toString()}`);
      });
    });
  }

  printProof(index: number): void {
    console.log(`root: ${this.getMerkleRoot()}`);
    this.getProof(index).forEach((proof, i) => {
      console.log(`
        ${i}: {
          direction: ${
            proof.direction.equals(Field(0)).toBoolean() ? 'right' : 'left'
          },
          hash: ${proof.hash}
        }
      `);
    });
  }
}
